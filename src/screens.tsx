import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BudgetItem, CashEntry, ChecklistItem } from './types';
import { BUDGET_LIMIT } from './seed';
import { money, remaining } from './logic';
import { BudgetRow, Section, Stat } from './ui';
import { styles } from './styles';

type Totals={estimated:number;paid:number;pending:number;cash:number};
type Recommendation=ReturnType<typeof import('./logic').recommendPurchases>;

export function HomeScreen({items,totals,recommendation,onPay}:{items:BudgetItem[];totals:Totals;recommendation:Recommendation;onPay:(item:BudgetItem,value:number)=>void}){
  return <><View style={styles.hero}><Text style={styles.heroLabel}>CAIXA DISPONIVEL</Text><Text style={styles.heroValue}>{money(totals.cash)}</Text><View style={styles.heroRow}><Text style={styles.heroSub}>Limite total: {money(BUDGET_LIMIT)}</Text><Text style={styles.heroSub}>Falta: {money(totals.pending)}</Text></View></View><View style={styles.grid}><Stat label="Previsto" value={money(totals.estimated)}/><Stat label="Ja pago" value={money(totals.paid)}/></View><Section title="Recomendacao agora"><Text style={styles.muted}>Mantendo 15% do caixa como reserva, podes usar ate {money(recommendation.spendable)}.</Text>{recommendation.selected.slice(0,4).map(r=><View style={styles.recRow} key={r.item.id}><View style={styles.flexOne}><Text style={styles.itemTitle}>{r.item.name}</Text><Text style={styles.muted}>{r.item.category} · prioridade {r.item.priority}</Text></View><View style={styles.alignEnd}><Text style={styles.price}>{money(r.suggested)}</Text><Pressable onPress={()=>onPay(r.item,r.suggested)}><Text style={styles.action}>Marcar compra</Text></Pressable></View></View>)}<Text style={styles.reserve}>Reserva preservada: {money(recommendation.reserve)}</Text></Section><Section title="Pendencias mais importantes">{items.filter(i=>i.status!=='concluido').sort((a,b)=>remaining(b)-remaining(a)).slice(0,5).map(i=><BudgetRow key={i.id} item={i} onPay={onPay}/>)}</Section></>;
}

export function PendingScreen({items,onPay}:{items:BudgetItem[];onPay:(item:BudgetItem,value:number)=>void}){
  return <Section title="Todas as pendencias">{items.map(i=><BudgetRow key={i.id} item={i} onPay={onPay}/>)}</Section>;
}

export function PurchasesScreen({items,onPay}:{items:BudgetItem[];onPay:(item:BudgetItem,value:number)=>void}){
  return <Section title="Compras antecipaveis"><Text style={styles.muted}>Itens nao pereciveis sao priorizados para adiantar quando houver caixa.</Text>{items.filter(i=>i.nonPerishable&&i.status!=='concluido').map(i=><BudgetRow key={i.id} item={i} onPay={onPay}/>)}</Section>;
}

export function CashScreen({cash,cashEntries,onOpen}:{cash:number;cashEntries:CashEntry[];onOpen:()=>void}){
  return <><View style={styles.hero}><Text style={styles.heroLabel}>SALDO ATUAL</Text><Text style={styles.heroValue}>{money(cash)}</Text></View><Pressable style={styles.primaryButton} onPress={onOpen}><Text style={styles.primaryText}>+ Registar movimento</Text></Pressable><Section title="Movimentos">{cashEntries.map(e=><View key={e.id} style={styles.recRow}><View style={styles.flexOne}><Text style={styles.itemTitle}>{e.description}</Text><Text style={styles.muted}>{e.date}</Text></View><Text style={[styles.price,{color:e.type==='entrada'?'#1B7F5C':'#B34747'}]}>{e.type==='entrada'?'+':'-'} {money(e.amount)}</Text></View>)}</Section></>;
}

export function ChecklistScreen({checklist,onToggle}:{checklist:ChecklistItem[];onToggle:(id:string)=>void}){
  return <Section title="Checklist do evento">{checklist.map(c=><Pressable key={c.id} style={styles.checkRow} onPress={()=>onToggle(c.id)}><View style={[styles.checkbox,c.done&&styles.checkboxDone]}><Text style={styles.checkboxText}>{c.done?'✓':''}</Text></View><Text style={[styles.itemTitle,c.done&&styles.done]}>{c.title}</Text></Pressable>)}</Section>;
}
