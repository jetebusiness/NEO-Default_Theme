export function moneyPtBR(money) 
{
    money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(money);
    return money;
};