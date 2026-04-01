// Inicializa animações AOS
AOS.init({ once: true, disable: 'mobile', offset: 50 });

// --- 1. EFEITO VISUAL AVANÇADO: PENAS ---
const svgs = {
    feather: `<svg viewBox="0 0 24 24" class="feather" width="100%" height="100%"><path d="M12,2C12,2 11.5,5.5 14,8C16.5,10.5 21,11 21,11C21,11 18.5,12 16,12.5C13.5,13 12,16 12,16C12,16 12,13 9.5,12.5C7,12 4.5,11 4.5,11C4.5,11 9,10.5 11.5,8C14,5.5 12,2 12,2Z"/></svg>`
};

function spawnParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    particle.innerHTML = svgs.feather;
    
    const size = Math.random() * 30 + 25;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    particle.style.left = Math.random() * 100 + 'vw';
    const duration = Math.random() * 4 + 4;
    
    particle.style.animation = `fall ${duration}s cubic-bezier(0.4, 0.0, 0.2, 1) forwards`;
    
    document.body.appendChild(particle);
    setTimeout(() => { particle.remove(); }, duration * 1000);
}
setInterval(spawnParticle, 400);

// --- 2. GERAÇÃO DINÂMICA DE CAMPOS ---
function gerarCamposConvidados() {
    let qtd = document.getElementById('convidados').value;
    const container = document.getElementById('lista-detalhada');
    container.innerHTML = ''; 

    if (!qtd || qtd <= 0) return;
    qtd = Math.min(qtd, 10); 

    for (let i = 0; i < qtd; i++) {
        container.innerHTML += `
            <div class="convidado-input">
                <input type="text" placeholder="Nome do ${i+1}º Ninja" class="nome-detalhe">
                <input type="number" placeholder="Idade" class="idade-detalhe">
            </div>
        `;
    }
}

// --- 3. ENVIO DE DADOS (PLANILHA + WHATSAPP) ---
async function confirmarPresenca() {
    const nome = document.getElementById('nome').value.trim();
    const qtd = document.getElementById('convidados').value;
    const btn = document.getElementById('btn-acao');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx6EO3uGwFUccgERpGSaEyC5V0qk1KeK69UT2ysoHI-Ldi0cFUDqRzvVXhri8FE2eHl0g/exec';

    if(!nome || !qtd || qtd <= 0) {
        alert("Identifique-se, Shinobi! O nome e a quantidade são obrigatórios.");
        return;
    }

    const nomesInputs = document.querySelectorAll('.nome-detalhe');
    const idadesInputs = document.querySelectorAll('.idade-detalhe');
    let detalhesConvidados = [];

    nomesInputs.forEach((input, index) => {
        const n = input.value.trim() || "Ninja Anônimo";
        const i = idadesInputs[index].value.trim() || "N/I";
        detalhesConvidados.push(`${n} (${i} anos)`);
    });
    const detalhesStr = detalhesConvidados.join('; ');

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('qtd', qtd);
    formData.append('detalhes', detalhesStr);

    btn.disabled = true;
    btn.innerHTML = 'Selando Pergaminho... ⏳';

    try {
        fetch(scriptURL, { 
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        const mensagemBase = `Olá! Eu, *${nome}*, confirmo presença no aniversário de 9 anos do Arthur com ${qtd} pessoa(s).`;
        const mensagemDetalhes = detalhesStr ? `\nNinjas na equipe:\n- ${detalhesConvidados.join('\n- ')}` : "";
        const mensagemFinal = `${mensagemBase}${mensagemDetalhes}\n\nPode aguardar por mim no esconderijo! 🦅🔴`;
        
        const linkWa = `https://wa.me/5511984401111?text=${encodeURIComponent(mensagemFinal)}`;
        
        window.open(linkWa, '_blank');
        setTimeout(() => { location.reload(); }, 1500);

    } catch (error) {
        alert('Erro no Jutsu de Selamento. Tente novamente!');
        btn.disabled = false;
        btn.innerHTML = 'Ativar Mangekyou (Confirmar)';
    }
}

// --- 4. CARREGAR LISTA DE CONFIRMADOS E GERIR ANIMAÇÕES ---
async function carregarListaPergaminho() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx6EO3uGwFUccgERpGSaEyC5V0qk1KeK69UT2ysoHI-Ldi0cFUDqRzvVXhri8FE2eHl0g/exec';
    const listaUl = document.getElementById('lista-presenca-final');
    const container = document.getElementById('pergaminho-container');
    const loadingBanner = document.getElementById('loading-banner');

    // 1. Prepara a UI para o modo "Carregamento"
    container.style.display = 'none';
    container.classList.remove('revelado');
    loadingBanner.style.display = 'block'; // Mostra o banner a pulsar

    try {
        const url = scriptURL + "?nocache=" + new Date().getTime();
        const response = await fetch(url, { cache: 'no-store' });
        const ninjas = await response.json();

        if (ninjas && ninjas.length > 0) {
            listaUl.innerHTML = ninjas.map((n, index) => {
                const detalhes = n.detalhes ? `<br><span style="font-size: 0.9em; color: #ff6b6b; display: inline-block; margin-top: 5px;">🗡️ Equipe: ${n.detalhes}</span>` : "";
                
                return `
                <li class="ninja-item" style="animation-delay: ${index * 0.15}s;">
                    <strong style="color: #fff;">${n.responsavel}</strong> 
                    <span style="color: #aaa; font-size: 0.9em;">(Clã de ${n.total})</span> 
                    ${detalhes}
                </li>`;
            }).join('');
        } else {
            listaUl.innerHTML = "<li class='ninja-item' style='text-align:center; border:none; background:transparent;'>Aguardando as primeiras invocações...</li>";
        }

    } catch (e) {
        listaUl.innerHTML = "<li class='ninja-item' style='text-align:center; color:#ff6b6b;'>Falha na percepção de Chakra.</li>";
    }

    // 2. Finaliza o Carregamento e Revela a Lista
    loadingBanner.style.display = 'none'; // Esconde o aviso de carregamento
    container.style.display = 'block'; // Prepara a caixa para deslizar
    
    setTimeout(() => {
        container.classList.add('revelado'); // Faz a caixa deslizar
    }, 50);
}

document.addEventListener('DOMContentLoaded', carregarListaPergaminho);