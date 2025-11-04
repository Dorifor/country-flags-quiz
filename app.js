const flagImageElement = document.querySelector('img#flag-img');
const choice1Button = document.querySelector('button#choice-1');
const choice2Button = document.querySelector('button#choice-2');
const choice3Button = document.querySelector('button#choice-3');
const choice4Button = document.querySelector('button#choice-4');
const nextRoundButton = document.querySelector('button#choice-next');
const badScoreLabel = document.querySelector('.score .bad');
const goodScoreLabel = document.querySelector('.score .good');
const langButtons = document.querySelectorAll('#lang-panel button');
const langToggle = document.querySelector('button#lang-toggle');
const menuToggle = document.querySelector('button#menu-toggle');
const gamePanel = document.querySelector('#game-panel');
const langPanel = document.querySelector('#lang-panel');
const menuPanel = document.querySelector('#menu-panel');

const MODE_UNTIMED = 0;
const MODE_TIMED = 1;
const MODE_REVERSED = 2;

const PANEL_MENU = 0;
const PANEL_LANG = 1;
const PANEL_GAME = 2;

let gameState = {
    round: 0,
    good: 0,
    bad: 0,
    hints: 0,
    consecutive: 0,
    skipped: [],
    mode: MODE_UNTIMED,
    lang: 'fr',
    currentPanel: PANEL_GAME
};

let roundState = {
    answer: 0,
    userGuess: -1,
    countryName: '',
    choices: [],
    locked: true
}

let countries;

function initElements() {
    choice1Button.addEventListener('click', selectAnswer);
    choice2Button.addEventListener('click', selectAnswer);
    choice3Button.addEventListener('click', selectAnswer);
    choice4Button.addEventListener('click', selectAnswer);
    for (const button of langButtons) {
        button.addEventListener('click', selectLang);
    }
    nextRoundButton.addEventListener('click', round);
    document.addEventListener('keydown', processUserInput);
    menuToggle.addEventListener('click', () => togglePanel(PANEL_MENU));
    langToggle.addEventListener('click', () => togglePanel(PANEL_LANG));
    updateScoreLabels();
    updateLangSelection();
}

function togglePanel(panel) {
    if (panel === gameState.currentPanel)
        gameState.currentPanel = PANEL_GAME;
    else
        gameState.currentPanel = panel;

    updatePanelsVisibility();
}

function updatePanelsVisibility() {
    gamePanel.classList.add('hidden');
    menuPanel.classList.add('hidden');
    langPanel.classList.add('hidden');
    menuToggle.classList.remove('toggled');
    langToggle.classList.remove('toggled');

    switch (gameState.currentPanel) {
        case PANEL_GAME:
            gamePanel.classList.remove('hidden');
            break;

        case PANEL_LANG:
            langPanel.classList.remove('hidden');
            langToggle.classList.add('toggled');
            break;

        case PANEL_MENU:
            menuPanel.classList.remove('hidden');
            menuToggle.classList.add('toggled');
            break;
    }
}

/**
 * 
 * @param {KeyboardEvent} e 
 */
function processUserInput(e) {
    if (e.repeat)
        return;

    if (e.key == "1")
        choice1Button.click();
    if (e.key == "2")
        choice2Button.click();
    if (e.key == "3")
        choice3Button.click();
    if (e.key == "4")
        choice4Button.click();
    if (e.key == "Enter")
        nextRoundButton.click();
}

function updateLangSelection() {
    for (const button of langButtons) {
        button.classList.remove('selected');
        if (button.value == gameState.lang)
            button.classList.add('selected');
    }
}

function selectLang(e) {
    const selectedLang = e.currentTarget.value;
    gameState.lang = selectedLang;
    roundState.locked = true;
    updateLangSelection();
    main();
    togglePanel(PANEL_LANG);
}

function getUserSelectedButton() {
    switch (roundState.userGuess) {
        case 0:
            return choice1Button;

        case 1:
            return choice2Button;

        case 2:
            return choice3Button;

        case 3:
            return choice4Button;
    }
}

function getAnswerButton() {
    switch (roundState.answer) {
        case 0:
            return choice1Button;

        case 1:
            return choice2Button;

        case 2:
            return choice3Button;

        case 3:
            return choice4Button;
    }
}

function resetQuizElements() {
    nextRoundButton.disabled = true;
    choice1Button.classList.remove('wrong');
    choice1Button.classList.remove('correct');
    choice2Button.classList.remove('wrong');
    choice2Button.classList.remove('correct');
    choice3Button.classList.remove('wrong');
    choice3Button.classList.remove('correct');
    choice4Button.classList.remove('wrong');
    choice4Button.classList.remove('correct');
}

function selectAnswer(e) {
    if (roundState.locked)
        return;

    roundState.locked = true;
    nextRoundButton.disabled = false;

    roundState.userGuess = parseInt(e.currentTarget.value);
    if (roundState.userGuess === roundState.answer) {
        gameState.good++;
    } else {
        gameState.bad++;
        getUserSelectedButton().classList.add('wrong');
    }

    updateScoreLabels();
    getAnswerButton().classList.add('correct');
}

function updateScoreLabels() {
    badScoreLabel.textContent = gameState.bad;
    goodScoreLabel.textContent = gameState.good;
}

function getRandomCountry(countries, except = null) {
    const random = countries[Math.ceil(countries.length * Math.random())]
    if (random == undefined || random == null || random == except || roundState.choices.includes(random))
        return getRandomCountry(countries, except);

    return random;
}

function updateQuizElements(countryToGuess, choices) {
    flagImageElement.src = `flags/${countryToGuess[0].toLowerCase()}.webp`;
    choice1Button.textContent = choices[0][1];
    choice2Button.textContent = choices[1][1];
    choice3Button.textContent = choices[2][1];
    choice4Button.textContent = choices[3][1];
}

function saveLocalData() {
    localStorage.setItem('save', JSON.stringify(gameState));
}

function loadLocalData() {
    if (localStorage.getItem('save'))
        gameState = JSON.parse(localStorage.getItem('save'));
}

function round() {
    if (!roundState.locked)
        return;

    gameState.round++;
    const country = getRandomCountry(countries);
    roundState.choices = [];
    roundState.locked = false;
    roundState.answer = Math.floor(Math.random() * 4);
    roundState.countryName = country[1];
    for (let i = 0; i < 4; i++) {
        if (i === roundState.answer)
            roundState.choices.push(country);
        else
            roundState.choices.push(getRandomCountry(countries, country));
    }
    resetQuizElements();
    updateQuizElements(country, roundState.choices);
    saveLocalData();
}

async function main() {
    const countriesListPath = `data/${gameState.lang}_country.json`;
    countries = await (await fetch(countriesListPath)).json();
    countries = Object.entries(countries);
    round();
}

loadLocalData();
initElements();
main();