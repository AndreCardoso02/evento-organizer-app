import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUDGET_LIMIT, EVENT_DATE, GUESTS, initialBudgetItems, initialCashEntries, initialChecklist } from './src/seed';
import { BudgetItem, CashEntry, ChecklistItem } from './src/types';
import { money, recommendPurchases, remaining } from './src/logic';

type Tab = 'inicio' | 'pendencias' | 'compras' | 'caixa' | 'checklist';
const STORAGE_KEY = '@nosso-evento/state-v1';

export default function App() {
  const [tab, setTab] = useState<Tab>('inicio');
  const [items, setItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>(initialCashEntries);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [cashModal, setCashModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [cashType, setCashType] = useState<'entrada' | 'saida'>('entrada');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        setItems(saved.items ?? initialBudgetItems);
        setCashEntries(saved.cashEntries ?? initialCashEntries);
        setChecklist(saved.checklist ?? initialChecklist);
      } catch {}
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items, cashEntries, checklist }));
  }, [items, cashEntries, checklist]);

  const totals = useMemo(() => {
    const estimated = items.reduce((s, i) => s + i.estimated, 0);
    const paid = items.reduce((s, i) => s + i.paid, 0);
    const pending = items.reduce((s, i) => s + remaining(i), 0);
    const cash = cashEntries.reduce((s, e) => s + (e.type === 'entrada' ? e.amount : -e.amount), 0);
    return { estimated, paid, pending, cash };
  }, [items, cashEntries]);

  const recommendation = useMemo(() => recommendPurchases(items, totals.cash), [items, totals.cash]);
  const days = Math.max(0, Math.ceil((new Date(EVENT_DATE).getTime() - Date.now()) / 86_400_000));

  const registerPayment = (item: BudgetItem, value: number) => {
    if (value <= 0) return;
    const actual = Math.min(value, remaining(item));
    setItems(current => current.map(i => i.id === item.id ? {
      ...i,
      paid: i.paid + actual,
      status: i.paid + actual >= i.estimated ? 'concluido' : 'parcial'
    } : i));
    setCashEntries(current => [{
      id: `${Date.now()}`,
      type: 'saida',
      amount: actual,
      description: item.name,
      date: new Date().toISOString().slice(0, 10)
    }, ...current]);
  };

  const saveCash = () => {
    const parsed = Number(amount.replace(/[^0-9]/g, ''));
    if (!parsed || !description.trim()) return Alert.alert('Preenche o valor e a descricao.');
    setCashEntries(current => [{ id: `${Date.now()}`, type: cashType, amount: parsed, description: description.trim(), date: new Date().toISOString().slice(0,10) }, ...current]);
    setAmount(''); setDescription(''); setCashModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Nosso Evento</Text>
          <Text style={styles.muted}>19 Dez 2026 · {GUESTS} convidados · {days} dias</Text>
        </View>
        <Text style={styles.heart}>♥</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'inicio' && <>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>CAIXA DISPONIVEL</Text>
            <Text style={styles.heroValue}>{money(totals.cash)}</Text>
            <View style={styles.heroRow}><Text style={styles.heroSub}>Limite total: {money(BUDGET_LIMIT)}</Text><Text style={styles.heroSub}>Falta: {money(totals.pending)}</Text></View>
          </View>

          <View style={styles.grid}>
            <Stat label="Previsto" value={money(totals.estimated)} />
            <Stat label="Ja pago" value={money(totals.paid)} />
          </View>

          <Section title="Recomendacao agora">
            <Text style={styles.muted}>Mantendo 15% do caixa como reserva, podes usar ate {money(recommendation.spendable)}.</Text>
            {recommendation.selected.slice(0,4).map(r => (
              <View style={styles.recRow} key={r.item.id}>
                <View style={{flex:1}}><Text style={styles.itemTitle}>{r.item.name}</Text><Text style={styles.muted}>{r.item.category} · prioridade {r.item.priority}</Text></View>
                <View style={{alignItems:'flex-end'}}><Text style={styles.price}>{money(r.suggested)}</Text><Pressable onPress={() => registerPayment(r.item, r.suggested)}><Text style={styles.action}>Marcar compra</Text></Pressable></View>
              </View>
            ))}
            <Text style={styles.reserve}>Reserva preservada: {money(recommendation.reserve)}</Text>
          </Section>

          <Section title="Pendencias mais importantes">
            {items.filter(i=>i.status!=='concluido').sort((a,b)=>remaining(b)-remaining(a)).slice(0,5).map(i => <BudgetRow key={i.id} item={i} onPay={registerPayment} />)}
          </Section>
        </>}

        {tab === 'pendencias' && <Section title="Todas as pendencias">
          {items.map(i => <BudgetRow key={i.id} item={i} onPay={registerPayment} />)}
        </Section>}

        {tab === 'compras' && <Section title="Compras antecipaveis">
          <Text style={styles.muted}>Itens nao pereciveis sao priorizados para adiantar quando houver caixa.</Text>
          {items.filter(i=>i.nonPerishable && i.status!=='concluido').map(i => <BudgetRow key={i.id} item={i} onPay={registerPayment} />)}
        </Section>}

        {tab === 'caixa' && <>
          <View style={styles.hero}><Text style={styles.heroLabel}>SALDO ATUAL</Text><Text style={styles.heroValue}>{money(totals.cash)}</Text></View>
          <Pressable style={styles.primaryButton} onPress={()=>setCashModal(true)}><Text style={styles.primaryText}>+ Registar movimento</Text></Pressable>
          <Section title="Movimentos">
            {cashEntries.map(e => <View key={e.id} style={styles.recRow}><View style={{flex:1}}><Text style={styles.itemTitle}>{e.description}</Text><Text style={styles.muted}>{e.date}</Text></View><Text style={[styles.price, {color: e.type==='entrada'?'#1B7F5C':'#B34747'}]}>{e.type==='entrada'?'+':'-'} {money(e.amount)}</Text></View>)}
          </Section>
        </>}

        {tab === 'checklist' && <Section title="Checklist do evento">
          {checklist.map(c => <Pressable key={c.id} style={styles.checkRow} onPress={()=>setChecklist(list=>list.map(x=>x.id===c.id?{...x,done:!x.done}:x))}><View style={[styles.checkbox,c.done&&styles.checkboxDone]}><Text style={styles.checkboxText}>{c.done?'✓':''}</Text></View><Text style={[styles.itemTitle,c.done&&styles.done]}>{c.title}</Text></Pressable>)}
        </Section>}
      </ScrollView>

      <View style={styles.tabs}>
        <TabButton current={tab} id="inicio" label="Inicio" onPress={setTab} />
        <TabButton current={tab} id="pendencias" label="Pendencias" onPress={setTab} />
        <TabButton current={tab} id="compras" label="Compras" onPress={setTab} />
        <TabButton current={tab} id="caixa" label="Caixa" onPress={setTab} />
        <TabButton current={tab} id="checklist" label="Checklist" onPress={setTab} />
      </View>

      <Modal visible={cashModal} transparent animationType="slide" onRequestClose={()=>setCashModal(false)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}>
          <Text style={styles.sectionTitle}>Novo movimento</Text>
          <View style={styles.switchRow}>
            <Pressable style={[styles.switch, cashType==='entrada'&&styles.switchActive]} onPress={()=>setCashType('entrada')}><Text>Entrada</Text></Pressable>
            <Pressable style={[styles.switch, cashType==='saida'&&styles.switchActive]} onPress={()=>setCashType('saida')}><Text>Saida</Text></Pressable>
          </View>
          <TextInput style={styles.input} placeholder="Valor em Kz" keyboardType="numeric" value={amount} onChangeText={setAmount}/>
          <TextInput style={styles.input} placeholder="Descricao" value={description} onChangeText={setDescription}/>
          <Pressable style={styles.primaryButton} onPress={saveCash}><Text style={styles.primaryText}>Guardar</Text></Pressable>
          <Pressable style={styles.secondaryButton} onPress={()=>setCashModal(false)}><Text>Cancelar</Text></Pressable>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

function Section({title, children}:{title:string;children:React.ReactNode}){return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>}
function Stat({label,value}:{label:string;value:string}){return <View style={styles.stat}><Text style={styles.muted}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>}
function TabButton({current,id,label,onPress}:{current:Tab;id:Tab;label:string;onPress:(t:Tab)=>void}){return <Pressable style={styles.tabButton} onPress={()=>onPress(id)}><Text style={[styles.tabText,current===id&&styles.tabActive]}>{label}</Text></Pressable>}
function BudgetRow({item,onPay}:{item:BudgetItem;onPay:(i:BudgetItem,v:number)=>void}){
  const left=remaining(item); return <View style={styles.recRow}><View style={{flex:1}}><Text style={styles.itemTitle}>{item.name}</Text><Text style={styles.muted}>{money(item.paid)} pago · falta {money(left)}</Text></View><View style={{alignItems:'flex-end'}}><Text style={styles.badge}>{item.status}</Text>{left>0&&<Pressable onPress={()=>onPay(item,left)}><Text style={styles.action}>Liquidar</Text></Pressable>}</View></View>
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F8F4F0'}, header:{paddingHorizontal:20,paddingTop:14,paddingBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},brand:{fontSize:25,fontWeight:'800',color:'#2A2421'},heart:{fontSize:26,color:'#8D4D57'},muted:{color:'#7B716B',fontSize:12,lineHeight:18},content:{padding:16,paddingBottom:95,gap:14},hero:{backgroundColor:'#2F2A27',borderRadius:22,padding:20},heroLabel:{color:'#D9CFC7',fontSize:11,fontWeight:'700',letterSpacing:1.2},heroValue:{color:'white',fontSize:34,fontWeight:'900',marginTop:6},heroRow:{flexDirection:'row',justifyContent:'space-between',marginTop:10},heroSub:{color:'#D9CFC7',fontSize:11},grid:{flexDirection:'row',gap:12},stat:{flex:1,backgroundColor:'white',padding:16,borderRadius:18},statValue:{fontSize:18,fontWeight:'800',color:'#2A2421',marginTop:5},section:{backgroundColor:'white',borderRadius:20,padding:16,gap:10},sectionTitle:{fontSize:18,fontWeight:'800',color:'#2A2421',marginBottom:2},recRow:{flexDirection:'row',gap:12,alignItems:'center',paddingVertical:10,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#E8E0DB'},itemTitle:{fontSize:14,fontWeight:'700',color:'#312B28'},price:{fontSize:14,fontWeight:'800',color:'#312B28'},action:{fontSize:12,fontWeight:'800',color:'#8D4D57',marginTop:4},reserve:{fontSize:12,fontWeight:'700',color:'#1B7F5C',marginTop:4},badge:{fontSize:10,textTransform:'uppercase',backgroundColor:'#F1ECE8',paddingHorizontal:8,paddingVertical:4,borderRadius:20,color:'#655B55'},primaryButton:{backgroundColor:'#8D4D57',padding:15,borderRadius:16,alignItems:'center'},primaryText:{color:'white',fontWeight:'800'},secondaryButton:{padding:14,borderRadius:16,alignItems:'center',marginTop:6},tabs:{position:'absolute',left:10,right:10,bottom:10,height:64,borderRadius:20,backgroundColor:'#FFFFFF',flexDirection:'row',alignItems:'center',shadowColor:'#000',shadowOpacity:.08,shadowRadius:10,elevation:5},tabButton:{flex:1,alignItems:'center',paddingVertical:18},tabText:{fontSize:11,color:'#8C827C'},tabActive:{color:'#8D4D57',fontWeight:'900'},checkRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#E8E0DB'},checkbox:{width:25,height:25,borderRadius:8,borderWidth:1.5,borderColor:'#B8ACA5',alignItems:'center',justifyContent:'center'},checkboxDone:{backgroundColor:'#8D4D57',borderColor:'#8D4D57'},checkboxText:{color:'white',fontWeight:'900'},done:{textDecorationLine:'line-through',color:'#9A918C'},modalBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,.25)',justifyContent:'flex-end'},modalCard:{backgroundColor:'#FFF',padding:20,paddingBottom:32,borderTopLeftRadius:26,borderTopRightRadius:26,gap:12},input:{borderWidth:1,borderColor:'#DED5CF',borderRadius:14,padding:14,fontSize:15},switchRow:{flexDirection:'row',gap:8},switch:{flex:1,padding:12,alignItems:'center',backgroundColor:'#F3EFEC',borderRadius:12},switchActive:{backgroundColor:'#E7D6DA'}
});
