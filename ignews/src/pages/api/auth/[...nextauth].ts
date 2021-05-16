import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { query } from 'faunadb';

import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user'
    }),
  ],
  jwt: {
    signingKey: process.env.SIGNING_KEY,              // -> Chave para tirar erro do Auth.
  },
  callbacks: {
    async signIn(user, account, profile) {

      const { email } = user;

      try{                                 
        await fauna.query(
          query.If(                                   // -> IF/ELSE para verificar usuário Duplicado.
            query.Not(
              query.Exists(
                query.Match(                         // -> Equivale ao WHERE do Banco de Dados.
                  query.Index('user_by_email'),
                  query.Casefold(user.email)
                )
              )
            ),
            query.Create(                          // -> Método pra fazer a inserção.
              query.Collection('users'),          // -> Nome da tabela.
              { data: { email } }                //-> Dados do usuário que queremos inserir.
            ), //else
            query.Get(                          // -> Equivale ao SELECT do Banco de Dados.
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(user.email)        // -> Deixa todas as letras do email em minúsculo.
              )
            )
          )
        )
        
        return true;                         // -> Significa que o Login deu certo.

      } catch {
        return false;                      // -> Login não deu certo.
      }
    },
  }
});