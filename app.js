// app.js
import { calcularSalarioCompleto } from './calculadora-regras.js';

let regrasCalculo;

// --- Seletores de Elementos do DOM ---
const formView = document.getElementById('form-view');
const resultView = document.getElementById('result-view');
const resultContainer = document.getElementById('resultado-container');
const mesReferenciaInput = document.getElementById('mesReferencia');

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

// ---- FUNÇÃO CORRIGIDA ----
function formatarMoeda(valor) {
    // Se 'valor' não for um número finito (se for undefined, null, NaN, etc.), trate como 0.
    if (typeof valor !== 'number' || !isFinite(valor)) {
        valor = 0;
    }
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
                    <td>Depósito FGTS do Mês</td>
                    <td class="valor">${formatarMoeda(fgts)}</td>
                </tr>
            </tbody>
        </table>
    `;
    mostrarResultados();
}


// --- Lógica Principal de Cálculo ---
function handleCalcular() {
    if (!regrasCalculo) {
        alert('As regras de cálculo ainda não foram carregadas. Tente novamente em um instante.');
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
        alert('Não foi possível carregar as configurações da calculadora. Verifique sua conexão.');
    }

    document.getElementById('btn-calcular').addEventListener('click', handleCalcular);
    document.getElementById('btn-voltar').addEventListener('click', mostrarFormulario);
    document.getElementById('btn-salvar').addEventListener('click', salvarDadosFixos);
    document.getElementById('btn-add-feriado').addEventListener('click', adicionarFeriado);
    document.getElementById('btn-limpar-feriados').addEventListener('click', limparFeriados);
    mesReferenciaInput.addEventListener('change', preencherDiasMes);
    
    document.querySelectorAll('input[name="tipoDias"]').forEach(radio => {
        radio.addEventListener('click', (e) => {
            const diasTrabInput = document.getElementById('diasTrab');
            if(e.target.value === 'mensal') {
                diasTrabInput.value = 30;
            } else {
                diasTrabInput.value = '';
                diasTrabInput.focus();
            }
        });
    });

    restaurarDadosFixos();
    preencherDiasMes();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado com sucesso!'))
            .catch(error => console.log('Erro ao registrar Service Worker:', error));
    }
});

