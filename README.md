# Nosso Evento

MVP em React Native + Expo para organizar o evento de 19/12/2026.

## Funcionalidades
- Dashboard financeiro do evento
- Limite global de 2.500.000 Kz
- Pendencias com previsto, pago e restante
- Caixa com entradas e saidas
- Recomendador de proximas compras preservando 15% de reserva
- Lista de compras antecipaveis / nao pereciveis
- Checklist do evento
- Dados iniciais do evento: 150 convidados, salao, comida, roupas, aliancas, bebidas e itens de cozinha
- Persistencia local com AsyncStorage

## Rodar
```bash
npm install
npx expo start
```

Depois use Expo Go no telemovel ou execute no emulador.

## Observacao sobre sincronizacao do casal
Esta primeira versao e local-first. Para que duas pessoas usem o mesmo evento em dispositivos diferentes, o proximo passo e ligar o app a Supabase/Firebase com autenticacao e uma tabela compartilhada do evento. A interface e a regra de negocio ja estao separadas para facilitar essa evolucao.

## Regra de recomendacao
O app calcula o caixa disponivel, preserva 15% como reserva e ordena pendencias por prioridade, dando vantagem a itens nao pereciveis que podem ser comprados antecipadamente.
