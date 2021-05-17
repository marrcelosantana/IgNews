import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/client';
import { stripe } from "../../services/stripe";


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST'){                                             // Verificando se o método da requisição é POST.
        const session = await getSession({ req })   
        
        const stripeCustomer = await stripe.customers.create({                        //Quem está pagando.
            email: session.user.email,
        })

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomer.id,                                          //ID do usuário no Stripe.         
            payment_method_types: ['card'],                                // Quais métodos de pagamento aceitar.
            billing_address_collection: 'required',                       //Obriga o usuário a preencher o endereço.
            line_items: [
                { price: 'price_1IqjvsHeTM8gLngyyNG8Km1O', quantity: 1 }             //ID do preço e a quantidade.
            ],
            mode: 'subscription',                                               //Indica que é pagamento recorrente. 
            allow_promotion_codes: true,                                        //Para poder criar cupons de desconto.
            success_url: process.env.STRIPE_SUCESS_URL,               //Página onde será redirecionado em caso de sucesso.
            cancel_url: process.env.STRIPE_CANCEL_URL                //Página onde será redirecionado caso seja cancelado.
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id });

    } else {
        res.setHeader('Allow', 'POST')                  //Explicando pro front que o método que a rota aceita é POST.
        res.status(405).end('Method not allowed');
    }
}