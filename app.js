const flagImageElement = document.querySelector('img#flag-img');
const choice1Button = document.querySelector('button#choice-1');
const choice2Button = document.querySelector('button#choice-2');
const choice3Button = document.querySelector('button#choice-3');
const choice4Button = document.querySelector('button#choice-4');
const nextRoundButton = document.querySelector('button#choice-next');
const badScoreLabel = document.querySelector('.score .bad');
const goodScoreLabel = document.querySelector('.score .good');
const langSelectDialog = document.querySelector('dialog.lang-select');
const langFrButton = document.querySelector('button#lang-fr');
const langEnButton = document.querySelector('button#lang-en');
const langEsButton = document.querySelector('button#lang-es');
const langDeButton = document.querySelector('button#lang-de');
const langButtons = document.querySelectorAll('dialog.lang-select button');
const langSettingButton = document.querySelector('button#lang-setting');

const MODE_UNTIMED = 0;
const MODE_TIMED = 1;
const MODE_REVERSED = 2;

let gameState = {
    round: 0,
    good: 0,
    bad: 0,
    hints: 0,
    consecutive: 0,
    skipped: [],
    mode: MODE_UNTIMED,
    lang: 'fr'
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
    langFrButton.addEventListener('click', selectLang);
    langEnButton.addEventListener('click', selectLang);
    langDeButton.addEventListener('click', selectLang);
    langEsButton.addEventListener('click', selectLang);
    nextRoundButton.addEventListener('click', round);
    langSettingButton.addEventListener('click', () => langSelectDialog.showModal());
    updateScoreLabels();
    updateLangSelection();
}

function updateLangSelection() {
    for (const button of langButtons) {
        button.classList.remove('selected');
        if (button.value == gameState.lang)
            button.classList.add('selected');
    }
}

function selectLang(e) {
    const selectedLang = e.target.value;
    gameState.lang = selectedLang;
    roundState.locked = true;
    updateLangSelection();
    langSelectDialog.close();
    main();
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

    roundState.userGuess = parseInt(e.target.value);
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
    if (random == except || roundState.choices.includes(random))
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
    console.log(roundState);
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