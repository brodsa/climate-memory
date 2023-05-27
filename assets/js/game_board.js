// get the data using fetch function from the slack CI community
const data = await fetch("assets/data/data.json").then(res => res.json());


/**
 * Select random cards based on the given number of pairs (numOfCards). 
 * For the game, the numOfCards stays fixed.
 * Returns an object of 6 card pairs (6 images and 6 text).
 */
const selectRandomCards = (numOfPairs=6) => {
    // shuffle the array elements from https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
    const shuffledCards = data.sort(() => 0.5 - Math.random());
    const selectedBasis = shuffledCards.slice(0,numOfPairs);

    // add the type of the card
    const selectedImg = []
    const selectedTxt = []
    for(let item of selectedBasis){
        item["type"] = "txt"
        selectedTxt.push(item);
        // how to clone the object from https://www.freecodecamp.org/news/clone-an-object-in-javascript/
        let element = { ... item }
        element["type"] = "img"
        selectedImg.push(element);
    }
    
    // put img cards and txt cards together and shuffle the array again
    const shuffled = selectedTxt.concat(selectedImg)
    const shuffledData = shuffled.sort(() => 0.5 - Math.random());
    console.log(shuffledData);
    return shuffledData;
}


/**
 * Generate the board layout and content for 
 * the given number of cards (see electRandomCards())
 * 
 */
const generateBoard = (numOfCards=12) => {
    const gameBoard = document.querySelector(".game__board");
    const cardsData = selectRandomCards();

    for(let i=0; i < numOfCards; i++){
        const card = document.createElement('div');
        const cardFront = document.createElement('div');
        const cardBack = document.createElement('div');
        const gameModal = document.createElement('div');
        
        // add attributes and classes
        card.classList.add('card');
        card.dataset.key = cardsData[i].id;
        card.id = `card-${i}`;
        cardFront.classList.add('card__front');
        cardBack.classList.add('card__back');
        gameModal.classList.add('game__modal');
        gameModal.id = `modal-${i}`;
        
        // add the content to the cards based on the type
        if (cardsData[i].type==="txt") {
            cardFront.innerText = cardsData[i].text;
            gameModal.innerText = cardsData[i].text;
        }       
        else if (cardsData[i].type==="img"){
            cardFront.innerText = cardsData[i].img;
            gameModal.innerText = cardsData[i].img;
        }else{
            console.log('not implemented for such type');
        }

        gameBoard.append(card);
        card.append(cardFront);
        card.append(cardBack);
        gameBoard.append(gameModal);
        
    }
};

generateBoard();


const cards = document.querySelectorAll(".card");
cards.forEach(card => card.addEventListener('click',flipCard));

let flipedCard = false;
let freezBoard = false;
let firstCard;
let secondCard;

function showModal(){
    this.classList.toggle('active');
    console.log('active');
}

// code inspiration from https://www.youtube.com/watch?v=ZniVgo8U7ek
function flipCard(){
    if (freezBoard) return;
    this.classList.add('flip');

    if(!flipedCard){
        // the first card has fliped
        flipedCard = true;
        firstCard = this;
        console.log('fliped first', firstCard);
    }else{
        // the second card has fliped
        flipedCard = false;
        secondCard = this;
        console.log('fliped second',secondCard);

        // check for match 
        checkMatch()
    }
    
}

function checkMatch(){
    //if clicked on the same card
    if(firstCard.id === secondCard.id){
        firstCard.classList.remove('flip');
    // if clicked on the matched card
    }else if(firstCard.dataset.key === secondCard.dataset.key){
        keepFliped();
    // no match
    }else{
        backFliped();
    }
};

function keepFliped(){
    firstCard.removeEventListener('click',flipCard);
    secondCard.removeEventListener('click',flipCard);
    console.log('match, leave flipped');
}

function backFliped(){
    freezBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        console.log('no match, flip back');
        freezBoard = false;
    }, 1000);
}