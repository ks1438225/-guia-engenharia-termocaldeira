# IHM Termocaldeira 4.0

Interface Homem-Máquina (IHM) desenvolvida para monitoramento e simulação do controle de uma **Termocaldeira 4.0**.

O projeto apresenta uma interface web com características de um painel industrial, permitindo configurar **temperatura, tempo de ciclo e energia**, além de controlar os estados de operação do sistema.

> **Observação:** a versão atual utiliza uma **simulação em JavaScript** dos valores de temperatura e energia. Ela não realiza comunicação direta com sensores, CLP ou atuadores físicos.

---

## Sobre o projeto

A IHM Termocaldeira 4.0 foi desenvolvida utilizando tecnologias web para representar uma interface de supervisão e controle de um processo térmico.

O sistema possui:

* Monitoramento de temperatura;
* Controle de tempo de ciclo;
* Monitoramento de energia;
* Configuração de setpoints;
* Modos de operação;
* Controle global de velocidade;
* Indicadores de estado;
* Comandos de operação;
* Parada de emergência simulada;
* Relógio em tempo real;
* Simulação dinâmica do processo.

---

# Interface

A interface está dividida em quatro áreas principais:

```text
┌───────────────────────────────────────────────────────────┐
│                    CABEÇALHO / STATUS                     │
├──────────────┬────────────────────────────────────────────┤
│              │                                            │
│ MONITORAMENTO│          INSTRUMENTOS PRINCIPAIS           │
│              │                                            │
│ Temperatura  │   TEMPERATURA   TEMPO      ENERGIA         │
│ Tempo        │                                            │
│ Energia      │                                            │
│              │                                            │
├──────────────┴────────────────────────────────────────────┤
│              CONTROLES DO SISTEMA                         │
├───────────────────────────────────────────────────────────┤
│              VELOCIDADE GLOBAL                            │
└───────────────────────────────────────────────────────────┘
```

---

# Funcionamento do sistema

O funcionamento da aplicação é controlado pelo objeto `state`, responsável por armazenar as principais informações do processo.

```javascript
const state = {
    running: false,
    paused: false,
    emergency: false,
    elapsed: 0,
    temp: 25,
    energy: 0,
    speed: 1,
    mode: {
        temp: "normal",
        time: "normal",
        energy: "normal"
    }
};
```

## Estados do sistema

| Variável    | Função                                        |
| ----------- | --------------------------------------------- |
| `running`   | Indica se o ciclo está em execução            |
| `paused`    | Indica se o ciclo está pausado                |
| `emergency` | Indica se a parada de emergência foi acionada |
| `elapsed`   | Armazena o tempo decorrido do ciclo           |
| `temp`      | Armazena a temperatura simulada               |
| `energy`    | Armazena a energia/potência simulada          |
| `speed`     | Define a velocidade global da simulação       |
| `mode`      | Define o modo de operação de cada parâmetro   |

---

# Simulação da temperatura

Durante a execução do ciclo, a temperatura é calculada progressivamente em direção ao setpoint configurado.

O sistema considera:

* Setpoint de temperatura;
* Modo de operação;
* Velocidade global;
* Diferença entre temperatura atual e desejada;
* Uma pequena variação aleatória para simular comportamento do processo.

A velocidade de resposta é determinada por:

```javascript
const temperatureRate =
    modes[state.mode.temp] *
    state.speed;
```

Os modos disponíveis possuem os seguintes fatores:

| Modo   | Fator |
| ------ | ----: |
| SLOW   |   0,5 |
| NORMAL |   1,0 |
| FAST   |   1,5 |
| MANUAL |   1,0 |

A temperatura também possui uma pequena variação aleatória, permitindo que o valor apresentado tenha comportamento semelhante a uma leitura de sensor.

---

# Simulação da energia

A energia é calculada de maneira semelhante à temperatura.

O sistema compara a energia atual com o setpoint:

```javascript
const energyRate =
    modes[state.mode.energy] *
    state.speed;
```

A partir dessa diferença, o valor é atualizado gradualmente.

Também é adicionada uma pequena variação aleatória para representar oscilações naturais de uma medição.

---

# Controle do tempo

O tempo de ciclo é armazenado na variável:

```javascript
state.elapsed
```

A cada atualização da simulação:

```javascript
state.elapsed += 0.2 * state.speed;
```

A simulação é executada a cada **200 ms**:

```javascript
setInterval(
    simulate,
    200
);
```

O tempo é convertido para o formato:

```text
MM:SS
```

através da função:

```javascript
formatTime(seconds)
```

Quando o tempo configurado é atingido, o ciclo é automaticamente interrompido.

---

# Modos de operação

Cada parâmetro possui quatro modos:

* **SLOW**
* **NORMAL**
* **FAST**
* **MANUAL**

A seleção é realizada através dos botões presentes em cada instrumento.

A função responsável por alterar o modo é:

```javascript
setMode(target, mode, button)
```

Ela atualiza o estado interno e também modifica visualmente o botão selecionado.

---

# Velocidade global

Além dos modos individuais, existe um controle global de velocidade.

São disponibilizadas três opções:

| Velocidade | Fator |
| ---------- | ----: |
| SLOW       |   50% |
| NORMAL     |  100% |
| FAST       |  150% |

O valor selecionado é armazenado em:

```javascript
state.speed
```

Esse fator influencia a velocidade de evolução da simulação.

---

# Controle do ciclo

## INICIAR

O botão **INICIAR** chama:

```javascript
startCycle();
```

O sistema verifica se não existe uma emergência ativa e, em seguida, coloca o processo em execução.

Estado:

```text
SISTEMA: CICLO EM EXECUÇÃO
CICLO:   CICLO ATIVO
```

---

## PARAR

O botão **PARAR** chama:

```javascript
stopCycle();
```

O processo é interrompido e o estado volta para:

```text
SISTEMA PARADO
CICLO PARADO
```

---

## PAUSAR

O botão **PAUSAR** altera:

```javascript
state.paused = true;
```

O processo deixa de ser atualizado, mantendo os valores atuais.

---

## RETOMAR

O botão **RETOMAR** remove o estado de pausa:

```javascript
state.paused = false;
```

O ciclo volta a ser executado normalmente.

---

## RESET

O botão **RESET** retorna o sistema aos valores iniciais:

```text
Temperatura: 25 °C
Energia:     0 kW
Tempo:       00:00
Ciclo:       Parado
Emergência:  Desativada
```

A função responsável é:

```javascript
resetSystem();
```

---

# Parada de emergência

O botão **E-STOP** ativa o estado de emergência:

```javascript
state.emergency = true;
```

Como consequência:

* O ciclo é interrompido;
* O estado de pausa é removido;
* O LED de falha é ativado;
* O LED de PEAK é ativado;
* O sistema fica bloqueado para operação normal.

A interface apresenta:

```text
EMERGÊNCIA ATIVADA
CICLO BLOQUEADO
```

Para sair desse estado, é necessário utilizar o comando **RESET**.

> Esta é uma parada de emergência **simulada por software**. Em uma aplicação industrial real, uma função de emergência deve utilizar circuito de segurança apropriado e independente da interface web.

---

# Indicadores

O sistema possui quatro indicadores principais:

### OPERAÇÃO

É ativado quando um ciclo está em execução.

```javascript
$("operationLed").classList.add("active");
```

### PEAK

É ativado quando a temperatura se aproxima do setpoint:

```javascript
if (state.temp >= temperatureTarget - 1)
```

### SENSOR

O elemento está presente na interface e pode ser utilizado posteriormente para indicar condições relacionadas aos sensores.

### FALHA

É ativado quando ocorre uma parada de emergência.

---

# Atalhos do teclado

A IHM também possui comandos por teclado.

| Tecla    | Função                           |
| -------- | -------------------------------- |
| `Enter`  | Iniciar ciclo                    |
| `Espaço` | Pausar/retomar                   |
| `R`      | Reset                            |
| `S`      | Parar                            |
| `Escape` | Emergência                       |
| `F12`    | Emergência                       |
| `↑`      | Aumentar setpoint de temperatura |
| `↓`      | Diminuir setpoint de temperatura |

Os comandos são tratados através do evento:

```javascript
document.addEventListener("keydown", ...)
```

---

# Relógio

O relógio da interface é atualizado automaticamente a cada segundo:

```javascript
setInterval(
    updateClock,
    1000
);
```

A função utiliza:

```javascript
new Date()
```

para obter a data e hora do computador.

O resultado é apresentado no padrão brasileiro:

```text
DD/MM/AAAA HH:MM:SS
```

---

# Ciclo de simulação

O processo geral pode ser representado da seguinte maneira:

```text
              INICIAR
                 │
                 ▼
        ┌─────────────────┐
        │ CICLO EM        │
        │ EXECUÇÃO        │
        └────────┬────────┘
                 │
       ┌─────────┼─────────┐
       │         │         │
       ▼         ▼         ▼
 TEMPERATURA   ENERGIA   TEMPO
       │         │         │
       └─────────┼─────────┘
                 │
                 ▼
          ATUALIZA DISPLAY
                 │
                 ▼
        TEMPO ATINGIU SP?
           │          │
          NÃO        SIM
           │          │
           │          ▼
           │     PARAR CICLO
           │
           └───────► repetir
```

A função `simulate()` é responsável pela atualização periódica do processo.

---

# Estrutura do projeto

```text
termocaldeira-4.0/
│
├── index.html
├── style.css
├── script.js
├── logo-aguia.png
└── README.md
```

### `index.html`

Responsável pela estrutura da interface.

### `style.css`

Responsável pelo layout e aparência visual.

### `script.js`

Responsável pela lógica, simulação e interação da IHM.

### `logo-aguia.png`

Logotipo utilizado na interface.

### `README.md`

Documentação do projeto.

---

# Tecnologias

* HTML5
* CSS3
* JavaScript
* DOM API
* `setInterval()`
* Eventos de teclado
* Eventos de interface
* `localDate` / `localTime` do navegador

O projeto não necessita de frameworks JavaScript para funcionar.

---

# Como executar

Clone ou copie o projeto para seu computador:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd termocaldeira-4.0
```

Depois abra:

```text
index.html
```

em um navegador.

Para facilitar o desenvolvimento, recomenda-se utilizar o **Live Server** no Visual Studio Code.

---

# Limitações atuais

A versão atual é uma **simulação local**, portanto:

* Não existe comunicação com CLP;
* Não existem sensores físicos conectados;
* Não existe controle real de aquecimento;
* A energia é simulada;
* A temperatura é simulada;
* Os estados são armazenados somente durante a execução da página;
* O botão E-STOP não substitui um circuito de emergência físico;
* Não há persistência de dados.

---

## Desenvolvimento

Projeto desenvolvido para representar uma **Interface Homem-Máquina aplicada a uma Termocaldeira 4.0**, utilizando tecnologias web para visualização, controle e simulação do processo.

---

## TERMOCALDEIRA 4.0

**Monitoramento • Controle • Automação • Indústria 4.0 • Programado Web Kauane Silva**
