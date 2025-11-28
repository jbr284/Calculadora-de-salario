// app.js
import { calcularSalarioCompleto } from './calculadora-regras.js';

let regrasCalculo;

// --- Seletores de Elementos do DOM ---
const formView = document.getElementById('form-view');
const resultView = document.getElementById('result-view');
const resultContainer = document.getElementById('resultado-container');
const mesReferenciaInput = document.getElementById('mesReferencia');

// Novos Seletores para Lógica de Férias
const boxCalculoFerias = document.getElementById('box-calculo-ferias');
const diasTrabInput = document.getElementById('diasTrab');
const inicioFeriasInput = document.getElementById('inicioFerias');
const qtdDiasFeriasInput = document.getElementById('qtdDiasFerias');
const feedbackFerias = document.getElementById('feedback-ferias');

// --- Funções de UI ---
function mostrarResultados() {
    formView.classList.add('hidden');
    resultView.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function mostrarFormulario() {
    resultView.classList.add('hidden');
    formView.classList.remove('hidden');
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarResultados(resultado) {
    const { proventos, descontos, liquido, fgts } = resultado;
    const liquidoMensal = liquido + descontos.adiantamento;

    const proventosRows = [];
    const descontosRows = [];

    if (proventos.vencBase > 0) proventosRows.push(`<tr><td>Salário Base Proporcional</td><td class="valor">${formatarMoeda(proventos.vencBase)}</td></tr>`);
    if (proventos.valorHE50 > 0) proventosRows.push(`<tr><td>Hora Extra 50%</td><td class="valor">${formatarMoeda(proventos.valorHE50)}</td></tr>`);
    if (proventos.valorHE60 > 0) proventosRows.push(`<tr><td>Hora Extra 60%</td><td class="valor">${formatarMoeda(proventos.valorHE60)}</td></tr>`);
    if (proventos.valorHE80 > 0) proventosRows.push(`<tr><td>Hora Extra 80%</td><td class="valor">${formatarMoeda(proventos.valorHE80)}</td></tr>`);
    if (proventos.valorHE100 > 0) proventosRows.push(`<tr><td>Hora Extra 100%</td><td class="valor">${formatarMoeda(proventos.valorHE100)}</td></tr>`);
    if (proventos.valorHE150 > 0) proventosRows.push(`<tr><td>Hora Extra 150%</td><td class="valor">${formatarMoeda(proventos.valorHE150)}</td></tr>`);
    if (proventos.valorNoturno > 0) proventosRows.push(`<tr><td>Adicional Noturno</td><td class="valor">${formatarMoeda(proventos.valorNoturno)}</td></tr>`);
    if (proventos.dsrHE > 0) proventosRows.push(`<tr><td>DSR sobre Horas Extras</td><td class="valor">${formatarMoeda(proventos.dsrHE)}</td></tr>`);
    if (proventos.dsrNoturno > 0) proventosRows.push(`<tr><td>DSR sobre Adicional Noturno</td><td class="valor">${formatarMoeda(proventos.dsrNoturno)}</td></tr>`);

    if (descontos.descontoFaltas > 0) descontosRows.push(`<tr><td>Faltas (dias)</td><td class="valor">${formatarMoeda(descontos.descontoFaltas)}</td></tr>`);
    if (descontos.descontoAtrasos > 0) descontosRows.push(`<tr><td>Atrasos (horas)</td><td class="valor">${formatarMoeda(descontos.descontoAtrasos)}</td></tr>`);
    if (descontos.adiantamento > 0) descontosRows.push(`<tr><td>Adiantamento Salarial</td><td class="valor">${formatarMoeda(descontos.adiantamento)}</td></tr>`);
    if (descontos.descontoPlano > 0) descontosRows.push(`<tr><td>Convênio SESI</td><td class="valor">${formatarMoeda(descontos.descontoPlano)}</td></tr>`);
    if (descontos.descontoSindicato > 0) descontosRows.push(`<tr><td>Sindicato</td><td class="valor">${formatarMoeda(descontos.descontoSindicato)}</td></tr>`);
    if (descontos.emprestimo > 0) descontosRows.push(`<tr><td>Empréstimo</td><td class="valor">${formatarMoeda(descontos.emprestimo)}</td></tr>`);
    if (descontos.descontoVA > 0) descontosRows.push(`<tr><td>Vale Alimentação</td><td class="valor">${formatarMoeda(descontos.descontoVA)}</td></tr>`);
    if (descontos.descontoVT > 0) descontosRows.push(`<tr><td>Vale Transporte (6%)</td><td class="valor">${formatarMoeda(descontos.descontoVT)}</td></tr>`);
    
    descontosRows.push(`<tr><td>INSS</td><td class="valor">${formatarMoeda(descontos.inss)}</td></tr>`);
    descontosRows.push(`<tr><td>IRRF</td><td class="valor">${formatarMoeda(descontos.irrf)}</td></tr>`);

    resultContainer.innerHTML = `
        <h2>Resultado do Cálculo</h2>
        <table class="result-table">
            <thead>
                <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr class="section-header"><td colspan="2">Proventos</td></tr>
                ${proventosRows.join('')}
                <tr class="summary-row">
                    <td>Total Bruto</td>
                    <td class="valor">${formatarMoeda(proventos.totalBruto)}</td>
                </tr>

                <tr class="section-header"><td colspan="2">Descontos</td></tr>
                ${descontosRows.join('')}
                <tr class="summary-row">
                    <td>Total de Descontos</td>
                    <td class="valor">${formatarMoeda(descontos.totalDescontos)}</td>
                </tr>
                
                <tr class="section-header"><td colspan="2">Resumo Final</td></tr>
                <tr class="final-result-main">
                    <td>Salário Líquido (Pagamento Final)</td>
                    <td class="valor">${formatarMoeda(liquido)}</td>
                </tr>
                <tr class="final-result-secondary">
                    <td>Salário Líquido Total (mês)</td>
                    <td class="valor">${formatarMoeda(liquidoMensal)}</td>
                </tr>
                <tr class="final-result-secondary fgts-row">
                    <td>Depósito FGTS do Mês (não descontado)</td>
                    <td class="valor">${formatarMoeda(fgts)}</td>
                </tr>
            </tbody>
        </table>
    `;
    mostrarResultados();
}


// --- LÓGICA DE FÉRIAS CORRIGIDA (3 MODOS) ---
function alternarModoDias() {
    const modo = document.querySelector('input[name="tipoDias"]:checked').value;
    
    // Reset visual
    diasTrabInput.style.backgroundColor = "#e8f0fe"; // Azul claro para indicar automático
    diasTrabInput.readOnly = true;

    if (modo === 'completo') {
        // MODO 1: Mês completo
        boxCalculoFerias.classList.add('hidden');
        diasTrabInput.value = 30;
        diasTrabInput.style.backgroundColor = "#f0f0f0";
        feedbackFerias.textContent = "";
    } else {
        // MODO 2 (Saída) e MODO 3 (Retorno)
        // Ambos precisam que o usuário informe os dados das férias para calcular a interseção
        boxCalculoFerias.classList.remove('hidden');
        
        // Limpa se for a primeira vez que abre, ou recalcula se já tiver dados
        if(!inicioFeriasInput.value || !qtdDiasFeriasInput.value) {
            diasTrabInput.value = "";
            feedbackFerias.textContent = "";
        } else {
            calcularDiasProporcionaisFerias();
        }
    }
}

function calcularDiasProporcionaisFerias() {
    // 1. Obter dados
    const mesRefStr = mesReferenciaInput.value; // YYYY-MM
    const inicioFeriasStr = inicioFeriasInput.value; // YYYY-MM-DD
    const diasFerias = parseInt(qtdDiasFeriasInput.value);
    const modo = document.querySelector('input[name="tipoDias"]:checked').value;

    // Validação básica
    if (!mesRefStr || !inicioFeriasStr || !diasFerias) {
        diasTrabInput.value = "";
        feedbackFerias.innerHTML = "<span style='color: #d32f2f'>Preencha o Mês de Referência e os dados das férias.</span>";
        return;
    }

    // 2. Definir o intervalo do Mês de Referência
    const [anoRef, mesRef] = mesRefStr.split('-').map(Number);
    const inicioMesRef = new Date(anoRef, mesRef - 1, 1);
    const fimMesRef = new Date(anoRef, mesRef, 0); 

    // 3. Definir o intervalo das Férias (Calculado a partir do início e duração)
    const dataInicioFerias = new Date(inicioFeriasStr);
    const dataFimFerias = new Date(dataInicioFerias);
    dataFimFerias.setDate(dataFimFerias.getDate() + diasFerias - 1);

    // 4. Calcular Interseção (Quantos dias dessas férias caem NO MÊS SELECIONADO?)
    const inicioIntersecao = new Date(Math.max(inicioMesRef, dataInicioFerias));
    const fimIntersecao = new Date(Math.min(fimMesRef, dataFimFerias));

    let diasDeFeriasNoMes = 0;

    // Se houver interseção válida
    if (inicioIntersecao <= fimIntersecao) {
        const diffTempo = fimIntersecao - inicioIntersecao;
        diasDeFeriasNoMes = Math.ceil(diffTempo / (1000 * 60 * 60 * 24)) + 1;
    }

    // 5. Calcular dias a trabalhar (Base 30 comercial)
    let diasTrabalhados = 30 - diasDeFeriasNoMes;

    // Ajustes de segurança
    if (diasTrabalhados < 0) diasTrabalhados = 0;
    if (diasTrabalhados > 30) diasTrabalhados = 30;

    // 6. Atualizar Interface e Texto de Feedback específico para cada modo
    diasTrabInput.value = diasTrabalhados;
    
    const fmt = date => date.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
    
    // Mensagem inteligente baseada no modo
    if (modo === 'saida_ferias') {
        feedbackFerias.innerHTML = `
            Saída em: <b>${fmt(dataInicioFerias)}</b>.<br>
            Dias de férias neste mês: <b>${diasDeFeriasNoMes}</b>.<br>
            Trabalhou até a saída: <b style="color:#0d47a1">${diasTrabalhados} dias</b>.
        `;
    } else if (modo === 'retorno_ferias') {
        feedbackFerias.innerHTML = `
            Retorno em: <b>${fmt(dataFimFerias)}</b> (Fim das férias).<br>
            Dias de férias neste mês: <b>${diasDeFeriasNoMes}</b>.<br>
            Trabalhou após o retorno: <b style="color:#0d47a1">${diasTrabalhados} dias</b>.
        `;
    }
}

// --- Lógica Principal de Cálculo ---
function handleCalcular() {
    if (!regrasCalculo) {
        alert('As regras de cálculo ainda não foram carregadas.');
        return;
    }
    const inputs = {
        salario: parseFloat(document.getElementById('salario').value) || 0,
        diasTrab: parseInt(document.getElementById('diasTrab').value) || 0,
        dependentes: parseInt(document.getElementById('dependentes').value) || 0,
        faltas: parseFloat(document.getElementById('faltas').value) || 0,
        atrasos: parseFloat(document.getElementById('atrasos').value) || 0,
        he50: parseFloat(document.getElementById('he50').value) || 0,
        he60: parseFloat(document.getElementById('he60').value) || 0,
        he80: parseFloat(document.getElementById('he80').value) || 0,
        he100: parseFloat(document.getElementById('he100').value) || 0,
        he150: parseFloat(document.getElementById('he150').value) || 0,
        noturno: parseFloat(document.getElementById('noturno').value) || 0,
        plano: document.getElementById('plano').value,
        sindicato: document.getElementById('sindicato').value,
        emprestimo: parseFloat(document.getElementById('emprestimo').value) || 0,
        diasUteis: parseInt(document.getElementById('diasUteis').value) || 0,
        domFeriados: parseInt(document.getElementById('domFeriados').value) || 0,
        descontarVT: document.getElementById('descontar_vt').value === 'sim'
    };
    const resultado = calcularSalarioCompleto(inputs, regrasCalculo);
    renderizarResultados(resultado);
}

// --- Funções Auxiliares (Feriados, localStorage, etc.) ---
function adicionarFeriado() {
    const dia = document.getElementById('diaFeriado').value;
    const mesAno = document.getElementById('mesReferencia').value;
    if (!dia || !mesAno) return;
    const [ano, mes] = mesAno.split('-');
    const data = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    const campo = document.getElementById('feriadosExtras');
    const feriados = campo.value ? campo.value.split(',') : [];
    if (feriados.includes(data)) return;
    feriados.push(data);
    campo.value = feriados.join(',');
    const div = document.createElement('div');
    div.textContent = data;
    div.className = 'feriado-box';
    div.title = 'Clique para remover';
    div.onclick = () => {
        const novaLista = feriados.filter(f => f !== data);
        campo.value = novaLista.join(',');
        div.remove();
        preencherDiasMes();
    };
    document.getElementById('listaFeriados').appendChild(div);
    document.getElementById('diaFeriado').value = "";
    preencherDiasMes();
}

function limparFeriados() {
    if (confirm('Tem certeza que deseja remover todos os feriados adicionados?')) {
        document.getElementById('feriadosExtras').value = '';
        document.getElementById('listaFeriados').innerHTML = '';
        preencherDiasMes();
    }
}

function preencherDiasMes() {
    const mesAno = document.getElementById('mesReferencia').value;
    if (!mesAno) return;
    const [ano, mes] = mesAno.split('-').map(Number);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    let diasUteis = 0;
    let domingos = 0;
    for (let d = 1; d <= diasNoMes; d++) {
        const data = new Date(ano, mes - 1, d);
        const diaSemana = data.getDay();
        if (diaSemana >= 1 && diaSemana <= 6) diasUteis++;
        if (diaSemana === 0) domingos++;
    }
    const feriadosFixos = ["01/01", "21/04", "01/05", "07/09", "12/10", "02/11", "15/11", "25/12"];
    let feriadosNacionaisNoMes = 0;
    feriadosFixos.forEach(fix => {
        const [dia, mesFix] = fix.split('/');
        if (parseInt(mesFix) === mes) {
            const dataFeriado = new Date(ano, mes - 1, parseInt(dia));
            if (dataFeriado.getDay() !== 0) {
                feriadosNacionaisNoMes++;
            }
        }
    });
    const feriadosExtras = document.getElementById('feriadosExtras').value;
    const qtdFeriados = feriadosExtras ? feriadosExtras.split(',').length : 0;
    document.getElementById('diasUteis').value = diasUteis - qtdFeriados - feriadosNacionaisNoMes;
    document.getElementById('domFeriados').value = domingos + qtdFeriados + feriadosNacionaisNoMes;
    
    // Se estiver em modo de férias (saída ou retorno), recalcula
    const modo = document.querySelector('input[name="tipoDias"]:checked')?.value;
    if(modo === 'saida_ferias' || modo === 'retorno_ferias') {
        calcularDiasProporcionaisFerias();
    }
}

function salvarDadosFixos() {
    const dados = {
        salario: document.getElementById('salario').value,
        dependentes: document.getElementById('dependentes').value,
        plano: document.getElementById('plano').value,
        sindicato: document.getElementById('sindicato').value
    };
    localStorage.setItem('dadosFixosCalculadora', JSON.stringify(dados));
    alert('Dados fixos salvos com sucesso!');
}

function restaurarDadosFixos() {
    const dadosSalvos = JSON.parse(localStorage.getItem('dadosFixosCalculadora'));
    if (dadosSalvos) {
        document.getElementById('salario').value = dadosSalvos.salario;
        document.getElementById('dependentes').value = dadosSalvos.dependentes;
        document.getElementById('plano').value = dadosSalvos.plano;
        document.getElementById('sindicato').value = dadosSalvos.sindicato;
    }
}

// --- Inicialização e Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        regrasCalculo = await fetch('regras.json').then(res => res.json());
    } catch (error) {
        console.error('Falha ao carregar as regras de cálculo:', error);
        alert('Erro ao carregar configurações. Verifique a conexão.');
    }

    document.getElementById('btn-calcular').addEventListener('click', handleCalcular);
    document.getElementById('btn-voltar').addEventListener('click', mostrarFormulario);
    document.getElementById('btn-salvar').addEventListener('click', salvarDadosFixos);
    document.getElementById('btn-add-feriado').addEventListener('click', adicionarFeriado);
    document.getElementById('btn-limpar-feriados').addEventListener('click', limparFeriados);
    mesReferenciaInput.addEventListener('change', preencherDiasMes);
    
    // Listeners para a nova lógica de 3 modos
    document.querySelectorAll('input[name="tipoDias"]').forEach(radio => {
        radio.addEventListener('change', alternarModoDias);
    });
    inicioFeriasInput.addEventListener('change', calcularDiasProporcionaisFerias);
    qtdDiasFeriasInput.addEventListener('input', calcularDiasProporcionaisFerias);
    
    // Conversor Automático de Horas
    const camposDeHora = document.querySelectorAll('.hora-conversivel');
    function converterInputParaDecimal() {
        let valor = this.value.replace('h', ':').replace(',', '.').trim();
        if (valor.includes(':')) {
            const partes = valor.split(':');
            const horas = parseFloat(partes[0]) || 0;
            const minutos = parseFloat(partes[1]) || 0;
            if(minutos < 0 || minutos > 59) {
                 this.value = horas.toFixed(2);
                 return;
            }
            this.value = (horas + (minutos / 60)).toFixed(2);
        } else if (valor) {
            const valorDecimal = parseFloat(valor) || 0;
            this.value = valorDecimal.toFixed(2);
        } else {
            this.value = '';
        }
    }
    camposDeHora.forEach(campo => {
        campo.addEventListener('blur', converterInputParaDecimal);
    });

    restaurarDadosFixos();
    // Inicia no modo correto (Mensal padrão)
    alternarModoDias();
    preencherDiasMes();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado com sucesso!'))
            .catch(error => console.log('Erro ao registrar Service Worker:', error));
    }
});
