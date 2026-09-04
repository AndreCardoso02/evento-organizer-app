import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BudgetItem } from './types';
import { money, remaining } from './logic';
import { styles } from './styles';

export type Tab = 'inicio' | 'pendencias' | 'compras' | 'caixa' | 'checklist';

export function Section({title,children}:{title:string;children:React.ReactNode}){
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

export function Stat({label,value}:{label:string;value:string}){
  return <View style={styles.stat}><Text style={styles.muted}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

export function TabButton({current,id,label,onPress}:{current:Tab;id:Tab;label:string;onPress:(tab:Tab)=>void}){
  return <Pressable style={styles.tabButton} onPress={()=>onPress(id)}><Text style={[styles.tabText,current===id&&styles.tabActive]}>{label}</Text></Pressable>;
}

export function BudgetRow({item,onPay}:{item:BudgetItem;onPay:(item:BudgetItem,value:number)=>void}){
  const left=remaining(item);
  return <View style={styles.recRow}><View style={styles.flexOne}><Text style={styles.itemTitle}>{item.name}</Text><Text style={styles.muted}>{money(item.paid)} pago · falta {money(left)}</Text></View><View style={styles.alignEnd}><Text style={styles.badge}>{item.status}</Text>{left>0&&<Pressable onPress={()=>onPay(item,left)}><Text style={styles.action}>Liquidar</Text></Pressable>}</View></View>;
}
