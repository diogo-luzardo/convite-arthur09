// Inicializa as animações do AOS
AOS.init({
    once: true,
    disable: 'mobile',
    offset: 50
});

// --- 1. EFEITO VISUAL: GENJUTSU DOS CORVOS ---
function criarCorvo() {
    const crow = document.createElement('div');
    crow.classList.add('crow');
    const size = Math.random() * 80 + 20; 
    crow.style.width = `${size}px`;
    crow.style.height = `${size}px`;
    crow.style.left = Math.random() * 100 + 'vw';
    crow.style.animation = `crow-fall ${Math.random() * 3 + 2}s linear`;
    document.body.appendChild(crow);
    setTimeout(() => { crow.remove(); }, 5000);
}
setInterval(criarCorvo, 300);

// --- 2. GERAÇÃO DINÂMICA DE CAMPOS (NOME/IDADE) ---
function gerarCamposConvidados() {
    const qtd = document.getElementById('convidados').value;
    const container = document.getElementById('lista-detalhada');
    container.innerHTML = ''; // Limpa antes de gerar

    // Limita para evitar abusos (ex: max 10 ninjas)
    const limite = Math.min(qtd, 10);

    for (let i = 0; i < limite; i++) {
        container.innerHTML += `
            <div class="convidado-input" data-aos="fade-right" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" placeholder="Nome do ${i+1}º convidado" class="nome-detalhe" style="flex: 2; padding: 10px;">
                <input type="number" placeholder="Idade" class="idade-detalhe" style="flex: 1; padding: 10px;">
            </div>
        `;
    }
}

// --- 3. ENVIO DE DADOS E WHATSAPP ---
async function confirmarPresenca() {
    const nome = document.getElementById('nome').value;
    const qtd = document.getElementById('convidados').value;
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx6EO3uGwFUccgERpGSaEyC5V0qk1KeK69UT2ysoHI-Ldi0cFUDqRzvVXhri8FE2eHl0g/exec';
    
    // Captura o botão de confirmar
    const btn = document.querySelector('.btn-confirmar');

    if(!nome || !qtd) return alert("Identifique-se, Shinobi! Nome e quantidade são obrigatórios.");

    // Coleta detalhes dos campos dinâmicos
    const nomesInputs = document.querySelectorAll('.nome-detalhe');
    const idadesInputs = document.querySelectorAll('.idade-detalhe');
    let detalhesConvidados = "";

    nomesInputs.forEach((input, index) => {
        const nomeCria = input.value || "Ninja Anônimo";
        const idadeCria = idadesInputs[index].value || "N/I";
        detalhesConvidados += `${nomeCria} (${idadeCria} anos); `;
    });

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('qtd', qtd);
    formData.append('detalhes', detalhesConvidados);

    // ==========================================
    // FEEDBACK VISUAL (LOADING)
    // ==========================================
    btn.disabled = true; // Impede múltiplos cliques
    btn.innerHTML = 'Selando Pergaminho... ⏳';
    btn.style.cursor = 'wait'; // Muda a setinha do mouse para o ícone de carregamento
    btn.style.opacity = '0.7';

    try {
        // Envio para o Google Sheets
        await fetch(scriptURL, { 
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString() 
        });

        console.log('Dados selados no pergaminho!');

        // Montagem da mensagem para WhatsApp com UTF-8 correto
        const mensagemBase = `Olá! Eu, ${nome}, confirmo presença no aniversário de 9 anos do Arthur (Tema Itachi) com ${qtd} pessoa(s).`;
        const mensagemDetalhes = detalhesConvidados ? `\nNinjas: ${detalhesConvidados}` : "";
        const mensagemFinal = `${mensagemBase}${mensagemDetalhes}\nPode me aguardar no esconderijo! 🦅🔴`;
        
        const linkWa = `https://wa.me/5511984401111?text=${encodeURIComponent(mensagemFinal)}`;
        
        // Abre WhatsApp e recarrega a página para atualizar a lista
        window.open(linkWa, '_blank');
        
        // Recarrega a página após 1,5 segundos para limpar o formulário e atualizar a lista
        setTimeout(() => { location.reload(); }, 1500);

    } catch (error) {
        alert('Erro no Jutsu de Selamento: ' + error.message);
        
        // Em caso de erro, devolve o botão ao estado normal para tentar de novo
        btn.disabled = false;
        btn.innerHTML = 'Ativar Mangekyou (Confirmar)';
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
    }
}

// --- 4. CARREGAR LISTA DE CONFIRMADOS (No Pergaminho) ---
async function carregarListaPergaminho() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx6EO3uGwFUccgERpGSaEyC5V0qk1KeK69UT2ysoHI-Ldi0cFUDqRzvVXhri8FE2eHl0g/exec';
    const listaUl = document.getElementById('lista-presenca-final');

    try {
        const urlSemCache = scriptURL + "?nocache=" + new Date().getTime();
        
        // Forçamos o navegador a não usar o cache
        const response = await fetch(urlSemCache, { cache: 'no-store' });
        const ninjas = await response.json();

        if (ninjas.length > 0) {
            listaUl.innerHTML = ninjas.map(n => {
                // Prepara a listinha de nomes
                const nomesCrianças = n.detalhes ? `<br><span style="font-size: 0.9em; color: #550000;">🗡️ Equipe: ${n.detalhes}</span>` : "";
                
                return `
                <li style="margin-bottom: 15px; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 5px;">
                    <span style="color: red;">☁️</span> <strong>${n.responsavel}</strong> (Clã de ${n.total}) 
                    ${nomesCrianças}
                </li>`;
            }).join('');
        } else {
            listaUl.innerHTML = "<li>Aguardando as primeiras invocações...</li>";
        }
    } catch (e) {
        console.log("Pergaminho ainda sendo preparado...");
    }
}

// Executa ao carregar a página
window.onload = carregarListaPergaminho;