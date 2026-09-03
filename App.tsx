import React, { useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { EVENT_DATE, GUESTS } from './src/seed';
import { useEventState } from './src/hooks/useEventState';
import { CashScreen, ChecklistScreen, HomeScreen, PendingScreen, PurchasesScreen } from './src/screens';
import { Tab, TabButton } from './src/ui';
import { styles } from './src/styles';

export default function App(){
  const [tab,setTab]=useState<Tab>('inicio');
  const [cashModal,setCashModal]=useState(false);
  const [amount,setAmount]=useState('');
  const [description,setDescription]=useState('');
  const [cashType,setCashType]=useState<'entrada'|'saida'>('entrada');
  const event=useEventState();
  const days=Math.max(0,Math.ceil((new Date(EVENT_DATE).getTime()-Date.now())/86_400_000));

  const saveCash=()=>{
    const parsed=Number(amount.replace(/[^0-9]/g,''));
    if(!parsed||!description.trim()) return Alert.alert('Preenche o valor e a descricao.');
    event.addCashEntry({type:cashType,amount:parsed,description:description.trim()});
    setAmount('');setDescription('');setCashModal(false);
  };

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content"/><View style={styles.header}><View><Text style={styles.brand}>Nosso Evento</Text><Text style={styles.muted}>19 Dez 2026 · {GUESTS} convidados · {days} dias</Text></View><Text style={styles.heart}>♥</Text></View><ScrollView contentContainerStyle={styles.content}>{tab==='inicio'&&<HomeScreen items={event.items} totals={event.totals} recommendation={event.recommendation} onPay={event.registerPayment}/>} {tab==='pendencias'&&<PendingScreen items={event.items} onPay={event.registerPayment}/>} {tab==='compras'&&<PurchasesScreen items={event.items} onPay={event.registerPayment}/>} {tab==='caixa'&&<CashScreen cash={event.totals.cash} cashEntries={event.cashEntries} onOpen={()=>setCashModal(true)}/>} {tab==='checklist'&&<ChecklistScreen checklist={event.checklist} onToggle={event.toggleChecklist}/>}</ScrollView><View style={styles.tabs}><TabButton current={tab} id="inicio" label="Inicio" onPress={setTab}/><TabButton current={tab} id="pendencias" label="Pendencias" onPress={setTab}/><TabButton current={tab} id="compras" label="Compras" onPress={setTab}/><TabButton current={tab} id="caixa" label="Caixa" onPress={setTab}/><TabButton current={tab} id="checklist" label="Checklist" onPress={setTab}/></View><Modal visible={cashModal} transparent animationType="slide" onRequestClose={()=>setCashModal(false)}><View style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.sectionTitle}>Novo movimento</Text><View style={styles.switchRow}><Pressable style={[styles.switch,cashType==='entrada'&&styles.switchActive]} onPress={()=>setCashType('entrada')}><Text>Entrada</Text></Pressable><Pressable style={[styles.switch,cashType==='saida'&&styles.switchActive]} onPress={()=>setCashType('saida')}><Text>Saida</Text></Pressable></View><TextInput style={styles.input} placeholder="Valor em Kz" keyboardType="numeric" value={amount} onChangeText={setAmount}/><TextInput style={styles.input} placeholder="Descricao" value={description} onChangeText={setDescription}/><Pressable style={styles.primaryButton} onPress={saveCash}><Text style={styles.primaryText}>Guardar</Text></Pressable><Pressable style={styles.secondaryButton} onPress={()=>setCashModal(false)}><Text>Cancelar</Text></Pressable></View></View></Modal></SafeAreaView>;
}
