const con = require('./database');
const jwt = require('jsonwebtoken');
const secret = "ishdbnf897234fgb9vgb7efsadfc2398hne9"
const bcrypt = require('bcrypt')
const validator = require('./validation')


const routes = [
    {
        method: 'GET',
        url: '/',
        handler: (req, reply) => {
            reply.view('./src/view/index.ejs')
        }
    },
    {
        method: 'GET',
        url: '/dashboard',
        handler: (req, reply) => {

            const token = req.headers.cookie.split("=")[1]
            const { id } = jwt.verify(token, secret)
            const viewQuery = "SELECT * FROM list right join user on list.phone=user.phone where user.phone='" + id + "';";

            con.query(viewQuery, (err, result) => {
                if (err) {
                    throw err;
                }
                reply.view('./src/view/dashboard.ejs', { data: result });
            })
        }
    },
    {
        method: 'POST',
        url: '/signup',
        handler: async (req, reply) => {
            const { name, phone, password } = req.body;
            const nameValidation = await validator.checkUserName(name)
            const phoneValidation = await validator.checkUserPhone(phone)
            const passwordValidation = await validator.checkUserPasswordStrength(password)
            if (nameValidation == false || phoneValidation == false || passwordValidation == false) {
                reply.status(406).send("Not A Proper Input")
            }
            const checkingForAvaiable = "SELECT EXISTS(SELECT * FROM user WHERE phone='" + phone + "') as numbers";
            con.query(checkingForAvaiable, (err, result) => {
                if (err || result[0].numbers == 1) {
                    return reply.status(406).send("wrong");
                }
                else {
                    bcrypt.hash(password, 10).then(function (hash) {
                        // Store hash in your password DB.
                        const InsertUser = "INSERT INTO `user` (`name`, `phone`, `password`) VALUES ('" + name + "', '" + phone + "', '" + hash + "');"
                        con.query(InsertUser, (err, result) => {
                            if (err) {
                                return reply.status(406).send("wrong");
                            }
                            return reply.redirect('/');
                        })
                    });

                }
            })

        }
    },
    {
        method: 'POST',
        url: '/login',
        handler: async (req, reply) => {
            const { phone, password } = req.body;
            const phoneValidation = await validator.checkUserPhone(phone)
            const passwordValidation = await validator.checkUserPasswordStrength(password)
            console.log(phone)
            if (phoneValidation == false || passwordValidation == false) {
                reply.status(406).send("Not A Proper Input")
            }
            const checkingForAvaiable = "SELECT EXISTS(SELECT * FROM user WHERE phone='" + phone + "') as numbers";
            con.query(checkingForAvaiable, (err, result, req) => {
                if (err || result[0].numbers == 0) {
                    return reply.status(406).send("No such user's exist");
                }
                else {

                    const checkUser = "SELECT password FROM user WHERE phone='" + phone + "';";
                    con.query(checkUser, async (err, result) => {
                        if (err) {
                            return reply.status(500).send("Internal Server Error");
                        }
                        try {
                            const match = await checkUserPassword(password, result[0].password)
                            if (match == true) {
                                const token = jwt.sign({ id: phone }, secret)

                                reply.setCookie(
                                    "user", token, { path: '/' }
                                );
                                reply.redirect('/dashboard')
                            }
                            else {
                                return reply.status(406).send("Invalid login details");
                            }
                        } catch (error) {
                            throw error
                        }


                    })
                }
            })
        }
    },
    {
        method: 'POST',
        url: '/addtask',
        handler: async (req, reply) => {
            const token = req.headers.cookie.split("=")[1]
            const { id } = jwt.verify(token, secret)

            var { heading, description, endDate } = req.body
            heading = heading.trim()
            description = description.trim()
            if (heading === "" || description === "") {
                return reply.redirect("/dashboard")
            }
            endDate = endDate == "" ? "NULL" : endDate
            const addQuery = "INSERT INTO `list` (`phone`, `heading`, `description`, `end`) VALUES ('" + id + "', '" + heading + "', '" + description + "','" + endDate + "');";
            con.query(addQuery, (err, result) => {
                if (err) {
                    return reply.status(406).send(err);
                }
                else {
                    return reply.redirect('/dashboard');
                }

            })
        }
    },
    {
        method: 'POST',
        url: '/deletetask',
        handler: async (req, reply) => {
            const token = req.headers.cookie.split("=")[1]
            const { id } = jwt.verify(token, secret)
            const deleteId = req.body.id
            const deleteQuery = "DELETE FROM `list` WHERE phone='" + id + "' and id='" + deleteId + "';";
            con.query(deleteQuery, (err, result) => {
                if (err) {
                    return reply.status(406).send("failed");
                }
                else {
                    return reply.redirect('/dashboard');
                }

            })
        }
    },
    {
        method: 'POST',
        url: '/logout',
        handler: (req, reply) => {
            reply.clearCookie('user')
            reply.redirect('/')
        }
    }

];

async function checkUserPassword(password, hash) {

    const match = await bcrypt.compare(password, hash);
    return match


}
module.exports = routes;