import express, { response } from 'express'

const app = express()

app.use('/ping', (request, response) => {    
    response.send('pong')
});

app.use('/user', (request, response) => {
    response.json([
        'Gabs',
        'Diego',
        'Leandro',
        'Matias'
    ])
})

app.listen(3000)