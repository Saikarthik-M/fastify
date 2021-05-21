// Require 
const fastify = require('fastify')({ logger: true })
const routes = require('./routes.js')

// Register
fastify.register(require('fastify-cookie'), {
    secret: "asdfsadfdas8f789fh789h%$#%^SAFD"
})
fastify.register(require('point-of-view'), {
    engine: {
        ejs: require('ejs')
    }
})
fastify.register(require('fastify-formbody'))


// Route
routes.forEach((routes) => {
    fastify.route(routes)
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(process.env.PORT | 3000)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()