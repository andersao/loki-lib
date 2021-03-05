## loki-session-javascript


#### Instalação

```
yarn add git+ssh://git@github.com:casamagalhaes/loki-session-javascript.git#master
```

#### Integração

```js
import LokiSession from 'loki-session-javascript';

const client = new LokiSession({ appId: 'varejofacil' });

/**
 * Se o loki não conseguir autorizar o token, irá enviar o evento `unauthorized`.
 * Nesse momento é uma boa hora para realizar o logout do usuário na sua aplicação
 * */
client.on('unauthorized', function(reason) => {
    console.error(reason);
    // lógica para o logout
});

/**
 * Quando o loki consegui autorizar o evento `authenticated` será enviado.
 * */
client.on('authenticated', function(err) => {
    console.log('Sessão autorizada!')
});

/**
 * Se houver qualquer erro durante a conexão com o socket, o evento `error` será enviado.
 * */
client.on('error', function(err) => {
    console.error('Erro na conexão com o socket!')
});


// Exemplos de integração

async function login(email, senha) {
    // Realiza o login com o backend e retornar os tokens, inclusive o sessionToken
    const { sessionToken } = await fazLoginComApi(email, senha);

    if(sessionToken) {
        await client.authenticate({ sessionToken });
    }
};

async function logout(email, senha) {
    // Seu app faz algo aqui e então destroy a sessão do loki
    await client.destroy();
};

async function onInit() {
    // no bootstrap do seu app, tentar recuperar a sessão armazenda e inicializar o loki
    const { sessionToken } = await buscarDadosGravados();
    await client.authenticate({ sessionToken });
};
```