import { signIn, useSession } from 'next-auth/client';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
    priceId: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps){
    const [session] = useSession();          //Para sabermos se o usuário está logado.

    async function handleSubscribe(){
        if (!session) {                  //Se não existir uma sessão, ele é redirecionado para a autenticação do Git.
            signIn('github')
            return;
        }

        try {
            const response = await api.post('/subscribe')
            const { sessionId } = response.data;
            const stripe = await getStripeJs()

            await stripe.redirectToCheckout({ sessionId })               //Função que redireciona o usuário pro checkout.

        } catch (err) {                                               //Tratativa de erro.
            alert(err.message);
        }
    }

    return (
        <button type = "button" className = { styles.subscribeButton } onClick = { handleSubscribe }>
            Subscribe Now
        </button>
    );
}