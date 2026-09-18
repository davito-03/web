

const motdQuotes = [
  "\"Stay awhile and listen.\" - Deckard Cain",
  "\"War. War never changes.\" - Fallout",
  "\"The right man in the wrong place can make all the difference in the world.\" - G-Man",
  "\"It's a-me, Mario!\" - Mario",
  "01001000011011110110110001100001",
  "\"Kept you waiting, huh?\" - Solid Snake"
];

import { unlockAchievement, unlockAchievementCounter } from './achievements.js';

export function initUI() {

  const hoverSound = document.getElementById('hover-sound');
  const clickSound = document.getElementById('click-sound');
  const interactiveButtons = document.querySelectorAll('.hub-link, .social-button, .donation-button, .floating-button, .game-card');

  if (hoverSound && clickSound) {
    interactiveButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.volume = 0.1;
        hoverSound.play().catch(e => {});
      });
      button.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.volume = 0.3;
        clickSound.play().catch(e => {});
      });
    });
  }



  const terminal = document.getElementById('terminal');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInput = document.getElementById('terminal-input');
  const mobileTerminalBtn = document.getElementById('mobile-terminal-btn');

  if (mobileTerminalBtn && terminal && terminalInput) {
    mobileTerminalBtn.addEventListener('click', () => {
      terminal.classList.toggle('show');
      if (terminal.classList.contains('show')) {
        terminalInput.focus();
      }
    });
  }

  if (terminal && terminalOutput && terminalInput) {
    const commandHistory = [];
    let historyIndex = 0;

    const themes = {
      default: { '--color-primary': '#00BFFF', '--color-accent': '#FFD700', '--color-secondary-accent': '#FF0050', '--color-success': '#00FF00' },
      matrix: { '--color-primary': '#00FF41', '--color-accent': '#39FF14', '--color-secondary-accent': '#BBF333', '--color-success': '#00FF41' },
      vaporwave: { '--color-primary': '#00F5D4', '--color-accent': '#FF00A8', '--color-secondary-accent': '#F72585', '--color-success': '#00F5D4' },
      calido: { '--color-primary': '#FF8C00', '--color-accent': '#FFD700', '--color-secondary-accent': '#FF4500', '--color-success': '#FF6347' }
    };

    function applyTheme(theme) {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(theme)) {
        root.style.setProperty(key, value);
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !e.target.closest('.modal-overlay')) {
        terminal.classList.toggle('show');
        if (terminal.classList.contains('show')) {
          terminalInput.focus();
        }
      }
    });

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const command = terminalInput.value.trim();
        printToTerminal(`<span style="color: #00BFFF;">davito@web:~$</span> ${command}`, true);
        
        if (command) {
          commandHistory.push(command);
          historyIndex = commandHistory.length;
        }

        executeCommand(command);
        terminalInput.value = '';
      } 
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
      } 
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
      }
    });

    function printToTerminal(text, isHTML = false) {
        const p = document.createElement('div');
        if (isHTML) { p.innerHTML = text; } 
        else { p.textContent = text; }
        terminalOutput.appendChild(p);
        terminal.scrollTop = terminal.scrollHeight;
    }

    async function executeCommand(command) {
        const parts = command.toLowerCase().split(' ');
        const mainCmd = parts[0];
        const arg = parts[1];

        if (mainCmd && typeof unlockAchievementCounter === 'function') {
            unlockAchievementCounter('comandante', 'terminalCommandCounter', 5, mainCmd);
        }

        switch (mainCmd) {
            case 'help':
                printToTerminal(
                    'Comandos disponibles:\n' +
                    '  `help`          - Muestra esta lista de comandos.\n' +
                    '  `socials`       - Muestra mis redes sociales.\n' +
                    '  `ls`            - Lista los "archivos" disponibles.\n' +
                    '  `cat [archivo]`   - Muestra el contenido de un archivo.\n' +
                    '  `theme [nombre]`- Cambia el tema de color.\n' +
                    '  `history`       - Muestra el historial de comandos de la sesión.\n' +
                    '  `email`         - Muestra mi email de contacto.\n' +
                    '  `motd`          - Muestra un mensaje del día.\n' +
                    '  `logros`        - Pista sobre los logros.\n' +
                    '  `date`          - Muestra la fecha y hora actual.\n' +
                    '  `clear`         - Limpia la pantalla de la terminal.\n' +
                    '  `exit`          - Cierra la terminal.'
                );
                if (typeof unlockAchievement === 'function') unlockAchievement('curioso');
                break;
            
            case 'history':
                if (commandHistory.length > 1) {
                    const historyText = commandHistory.slice(0, -1).map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
                    printToTerminal('Historial de la sesión:\n' + historyText);
                } else {
                    printToTerminal('No hay comandos en el historial.');
                }
                break;

            case 'email':
                printToTerminal('Puedes contactarme en: <a href="mailto:soy@davito.es" style="color: var(--color-accent);">soy@davito.es</a>', true);
                break;

            case 'motd':
                printToTerminal("Buscando una cita en la galaxia...");
                try {

                    if (window.getRandomQuote) {
                        terminalOutput.removeChild(terminalOutput.lastChild); 
                        const quote = window.getRandomQuote();
                        printToTerminal(`💫 ${quote}`);
                        console.log(`✅ Cita mostrada del banco local (${window.QUOTE_BANK_SIZE} disponibles)`);
                        break;
                    }

                    let data = null;

                    try {
                        const response = await fetch("https://api.quotable.io/random", {
                            mode: 'cors',
                            headers: {
                                'Accept': 'application/json',
                            }
                        });
                        if (response.ok) {
                            data = await response.json();
                        }
                    } catch (corsError) {
                        console.log('API directa falló, intentando alternativa...');
                    }

                    if (!data) {
                        try {
                            const response = await fetch("https://quotegarden.herokuapp.com/api/v3/quotes/random", {
                                mode: 'cors'
                            });
                            if (response.ok) {
                                const result = await response.json();
                                if (result.statusCode === 200 && result.data) {
                                    data = {
                                        content: result.data.quoteText,
                                        author: result.data.quoteAuthor
                                    };
                                }
                            }
                        } catch (altError) {
                            console.log('API alternativa también falló');
                        }
                    }

                    if (data) {
                        terminalOutput.removeChild(terminalOutput.lastChild); 
                        printToTerminal(`> "${data.content}"\n  - ${data.author}`);
                    } else {
                        throw new Error('Todas las APIs de citas fallaron');
                    }
                } catch (error) {
                    console.error("Error al cargar la cita desde las APIs:", error);
                    terminalOutput.removeChild(terminalOutput.lastChild);
                    printToTerminal("No se pudo conectar al servidor de citas. Usando una local:");
                    const randomIndex = Math.floor(Math.random() * motdQuotes.length);
                    printToTerminal(`> ${motdQuotes[randomIndex]}`);
                }
                break;

            case 'logros':
                printToTerminal(
`System Log: Se han detectado anomalías...
   - Un código antiguo...
   - Comandos de sistema inusuales...
   - Exploración de todas las secciones...

// Fin del registro.`);
                break;
            
            case 'theme':
                if (!arg) {
                    printToTerminal('Uso: theme [nombre_del_tema]\nTemas disponibles: default, matrix, vaporwave, calido');
                } else if (themes[arg]) {
                    applyTheme(themes[arg]);
                    printToTerminal(`Tema '${arg}' aplicado.`);
                } else {
                    printToTerminal(`Error: Tema '${arg}' no encontrado.`);
                }
                break;
            case 'socials':
                printToTerminal( 'Mis redes:\n\n' + '  - Gallery:    <a href="https://davito.es/media" target="_blank">davito.es/media</a>\n' + '  - Twitter:    <a href="https://x.com/davito_03" target="_blank">x.com/davito_03</a>\n' + '  - Instagram:  <a href="https://instagram.com/davito._.03" target="_blank">instagram.com/davito._.03</a>\n' + '  - TikTok:     <a href="https://tiktok.com/@davito_03" target="_blank">tiktok.com/@davito_03</a>\n' + '  - Twitch:     <a href="https://twitch.com/davito_03" target="_blank">twitch.tv/davito_03</a>\n' + '  - Telegram:   <a href="https://t.me/davito_03" target="_blank">t.me/davito_03</a>\n' + '  - GitHub:     <a href="https://github.com/davito-03" target="_blank">github.com/davito-03</a>\n' + '  - Langosta\'s: <a href="https://discord.gg/S22tUgJztd" target="_blank">Discord (Langosta\'s Gang)</a>\n' + '  - P. Frikis:  <a href="https://discord.gg/8fZQ8QzRGv" target="_blank">Discord (Putos Frikis)</a>', true);
                if (typeof unlockAchievement === 'function') unlockAchievement('cotilla');
                break;
            case 'neofetch':
                const neofetchOutput = `<div style="display: flex; gap: 20px;"><pre style="color: #00BFFF; font-family: monospace; white-space: pre;">      _-o#&&*&-o!_-
   _!o##&#&&*!o\\_
 _!o##&#&&*!o\\
!o##&#&&*!o\\
!o##&#&&*!o\\
!o##&#&&*!o\\
 -o!_-
</pre><div><p><span style="color: #FFD700;">davito@davito.es</span></p><p>------------------</p><p><span style="color: #FFD700;">OS:</span> DaviOS v1.0 Retro Wave</p><p><span style="color: #FFD700;">Host:</span> Custom Built Starship</p><p><span style="color: #FFD700;">Kernel:</span> 5.4.0-davito</p><p><span style="color: #FFD700;">Uptime:</span> 4 years, 2 months, 1 day</p><p><span style="color: #FFD700;">Shell:</span> zsh 5.8</p><p><span style="color: #FFD700;">Terminal:</span> DaviTerm</p></div></div>`;
                printToTerminal(neofetchOutput, true);
                if (typeof unlockAchievement === 'function') unlockAchievement('sysAdmin');
                break;
            case 'cat':
                if (!arg) { printToTerminal('Uso: `cat [nombre_del_archivo]`'); } 
                else if (arg === 'bio.txt') { 
                    printToTerminal('hola, soy davito o David. desarrollo algunas cositas cuando me acuerdo de que me gusta la programación. tengo 22 añitos y soy de león, españa. también canto en un coro como bajo, juego genshin impact, wuthering waves, honkai star rail, zenless zone zero y valorant sobre todo. artistas fav bad bunny de lejos. gracias por leer todo lo que cuento jiji, si quieres saber más de mí puedes contactarme por tantos sitios como ves en la web que tanto esfuerzo me ha costado hacer, espero que te guste! <3');
                    if (typeof unlockAchievement === 'function') unlockAchievement('arqueologo');
                } 
                else if (arg === 'skills.txt') { 
                    printToTerminal('--- Habilidades ---\n> Desarrollo Web (HTML, CSS, JavaScript)\n> Experiencia con frameworks modernos\n> Bases de datos (SQL, NoSQL/Firestore)\n> Git y control de versiones\n> Capacidad para dormir a las 5 de la mañana y seguir funcionando');
                    if (typeof unlockAchievement === 'function') unlockAchievement('recruiter');
                } 
                else { printToTerminal(`cat: ${arg}: No such file or directory`); }
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                break;
            case 'exit':
                terminal.classList.remove('show');
                break;
            case 'davito':
                printToTerminal('ese soy yo :D');
                break;
            case 'date':
                printToTerminal(new Date().toLocaleString('es-ES'));
                break;
            case 'ls':
                printToTerminal('drwxr-xr-x 2 davito staff 64 Jul 21 22:15 .\n-rw-r--r-- 1 davito staff 128 Jul 20 18:30 bio.txt\n-rw-r--r-- 1 davito staff 256 Jul 19 14:00 skills.txt');
                break;
            default:
                printToTerminal(`Comando no reconocido: ${command}. Escribe 'help' para ver la lista de comandos.`);
                break;
        }
    }

    printToTerminal('Terminal de davito.es iniciada. Escribe `help` para ver los comandos.');
    printToTerminal('Pulsa [ESC] para salir.');
  }
}





