<script setup>
import { computed, reactive, ref } from 'vue';
import rates from '../datasets/market-rates.json';
import { compareOffers, validateProfile } from './mortgage.mjs';
import { trackInteraction } from './tracking.mjs';
const variant=new URLSearchParams(location.search).get('variant')==='b'?'b':'a';
const mode=import.meta.env.VITE_MARKET_DATA_MODE==='verified'?'verified':'demo';
const form=reactive({loanAmount:180000,propertyPrice:225000,valuation:225000,loanYears:30,netIncome:3200,otherDebt:200,euribor:2.4});
const consent=ref(false),submitted=ref(false),selected=ref(null),dialog=ref(null);
const errors=computed(()=>validateProfile(form));
const offers=computed(()=>errors.value.length?[]:compareOffers(form,rates,{mode}));
const money=value=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
const percent=value=>new Intl.NumberFormat('pt-PT',{maximumFractionDigits:1}).format(value)+'%';
window.dataLayer=window.dataLayer||[];
function track(name){trackInteraction(name,{consent:consent.value,variant,dataLayer:window.dataLayer});}
function compare(){submitted.value=true;if(!errors.value.length)track('scenario_compared');}
const summary=computed(()=>selected.value?['RESUMO DE CENÁRIO — DEMONSTRAÇÃO',selected.value.bank_name,selected.value.product_name,'Montante: '+money(form.loanAmount),'Prazo: '+form.loanYears+' anos','Prestação inicial (capital + juros): '+money(selected.value.initialPayment),'Após fase fixa (hipótese Euribor '+percent(form.euribor)+'): '+(selected.value.afterFixedPayment===null?'Não aplicável':money(selected.value.afterFixedPayment)),'LTV do cenário: '+percent(selected.value.ltv),'Não é uma proposta bancária. Não inclui seguros, comissões ou impostos.','Taxas fictícias. Solicite uma FINE e avaliação de condições a uma entidade autorizada.'].join('\n'):'');
function prepare(offer){selected.value={...offer};track('proposal_request_prepared');dialog.value.showModal();}
function download(){const url=URL.createObjectURL(new Blob([summary.value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='resumo-cenario-demo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
</script>

<template>
  <a class="skip" href="#simulador">Saltar para o simulador</a>
  <main>
    <nav class="nav"><a class="brand" href="#"><span class="brand-mark">c.</span> CASA CLARA</a><a href="#metodo">Como comparar</a><span class="demo-tag">PROJETO DEMONSTRATIVO</span></nav>
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">CRÉDITO HABITAÇÃO / CENÁRIOS</p>
        <h1>{{ variant==='b'?'Uma prestação clara. Uma decisão informada.':'A próxima casa começa com contas claras.' }}</h1>
        <p class="lede">Compare prestações e veja o que pode mudar no fim da taxa fixa. Explore três cenários com os mesmos dados e hipóteses.</p>
        <a class="text-link" href="#simulador">Comparar o meu cenário <span>↗</span></a>
        <div class="hero-detail"><span class="detail-line"></span><p>Dados fictícios, identificados.<br>Sem pedidos a bancos. Sem aprovação de crédito.</p></div>
        <div class="house" aria-hidden="true"><div class="house-roof"></div><div class="house-body"><div class="house-window"></div><div class="house-door"></div></div><span class="house-label">ESPAÇO PARA PLANEAR</span></div>
      </div>
      <form id="simulador" class="calculator" @submit.prevent="compare">
        <div class="form-title"><span class="number">01</span><div><p class="eyebrow">O SEU PONTO DE PARTIDA</p><h2>Desenhe o cenário</h2></div></div>
        <fieldset><legend>Imóvel e financiamento</legend><div class="field-grid">
          <label>Montante do empréstimo (€)<input v-model.number="form.loanAmount" type="number" min="1000" max="3000000" step="1000" required></label>
          <label>Prazo (anos)<input v-model.number="form.loanYears" type="number" min="1" max="40" step="1" required></label>
          <label>Preço do imóvel (€)<input v-model.number="form.propertyPrice" type="number" min="1000" max="5000000" step="1000" required></label>
          <label>Avaliação estimada (€)<input v-model.number="form.valuation" type="number" min="1000" max="5000000" step="1000" required></label>
        </div></fieldset>
        <fieldset><legend>Orçamento mensal</legend><div class="field-grid">
          <label>Rendimento líquido mensal (€)<input v-model.number="form.netIncome" type="number" min="1" max="1000000" step="1" required></label>
          <label>Outros créditos por mês (€)<input v-model.number="form.otherDebt" type="number" min="0" max="1000000" step="1" required></label>
        </div></fieldset>
        <label class="euribor-field">Hipótese de Euribor após fase fixa (%)<input v-model.number="form.euribor" type="number" min="0" max="15" step="0.05" required><small>Hipótese editável de simulação; não é a Euribor atual nem uma previsão.</small></label>
        <label class="consent"><input v-model="consent" type="checkbox"><span>Permitir medição de utilização.<small>Sem envio externo nesta demonstração.</small></span></label>
        <button class="primary" type="submit">Comparar cenários <span>→</span></button>
        <p class="form-note">Os valores ficam nesta página. Não recolhemos contactos.</p>
        <p v-if="submitted&&errors.length" class="error" role="alert">Reveja os valores do formulário.</p>
      </form>
    </section>
    <section v-if="submitted&&!errors.length" id="resultados" class="results" aria-live="polite">
      <div class="section-top"><div><p class="eyebrow">02 / COMPARAÇÃO</p><h2>Cenários para explorar</h2></div><p>Ordenados pela prestação inicial.<br>Capital e juros, sem outros encargos.</p></div>
      <p class="result-note">{{mode==='demo'?'Todas as taxas e limites abaixo são fictícios. Não representam ofertas atuais de bancos.':'Apenas ofertas com verificação e validade registadas são elegíveis para apresentação.'}}</p>
      <div v-if="offers.length" class="offer-grid">
        <article v-for="(offer,index) in offers" :key="offer.bank_id" class="offer"><div class="offer-head"><span>CENÁRIO {{String(index+1).padStart(2,'0')}}</span><span>{{mode==='demo'?'EXEMPLO':'VERIFICADO'}}</span></div><h3>{{offer.bank_name}}</h3><p class="product">{{offer.product_name}}</p><p class="payment">{{money(offer.initialPayment)}}<small>/ mês inicial</small></p><dl><div><dt>TAN inicial</dt><dd>{{percent(offer.fixed_rate)}}</dd></div><div><dt>Período fixo</dt><dd>{{offer.fixedMonths}} meses</dd></div><div><dt>Após a fase fixa*</dt><dd>{{offer.afterFixedPayment===null?'Não aplicável':money(offer.afterFixedPayment)}}</dd></div><div><dt>DSTI inicial / cenário*</dt><dd>{{percent(offer.dsti)}} / {{percent(offer.scenarioDsti)}}</dd></div><div><dt>LTV</dt><dd>{{percent(offer.ltv)}}</dd></div></dl><p class="cost-note">TAEG e MTIC: {{offer.taeg===null?'não disponíveis neste exemplo':'consultar FINE do exemplo representativo'}}.</p><button class="secondary" @click="prepare(offer)">Preparar pedido de proposta <span>↗</span></button></article>
      </div>
      <p v-else class="empty">Não há cenários compatíveis com os limites deste dataset. Isto não constitui uma decisão de crédito. Em modo verificado, confirme também a validade das fontes.</p>
      <p class="footnote">* Estimativa com a hipótese de Euribor indicada + spread, aplicada ao capital remanescente e prazo restante. Não inclui seguros, comissões, impostos ou futuras revisões de taxa.</p>
    </section>
    <section id="metodo" class="method"><p class="eyebrow">COMPARAR COM CONTEXTO</p><h2>Uma taxa não conta<br>a história toda.</h2><div class="method-grid"><article><span>01</span><h3>Durante a taxa fixa</h3><p>A prestação usa a TAN inicial e o prazo total de amortização. A taxa fixa só se aplica ao período identificado.</p></article><article><span>02</span><h3>Depois da fase fixa</h3><p>O cenário recalcula a prestação sobre o capital remanescente. Alterar a hipótese de Euribor muda o resultado.</p></article><article><span>03</span><h3>Antes de contratar</h3><p>Compare a FINE, TAEG, MTIC, seguros e condições de bonificação. A avaliação final pertence à instituição.</p></article></div></section>
    <footer><span>CASA CLARA / Protótipo de portfólio</span><a href="https://clientebancario.bportugal.pt/pt-pt/taxas-de-juro-no-credito-habitacao" target="_blank" rel="noopener noreferrer">Informação do Banco de Portugal ↗</a></footer>
    <dialog ref="dialog" @click="event=>{if(event.target===dialog)dialog.close()}"><div class="dialog-head"><p class="eyebrow">RESUMO LOCAL</p><button class="close" aria-label="Fechar resumo" @click="dialog.close()">×</button></div><h2>Prepare a próxima conversa.</h2><p>Este resumo não envia dados a bancos nem solicita uma proposta formal. Pode guardá-lo para rever os pressupostos.</p><pre>{{summary}}</pre><button class="primary" @click="download">Descarregar resumo</button><button class="secondary" @click="dialog.close()">Voltar à comparação</button></dialog>
  </main>
</template>
