import {default as script} from "./index.js";



const parameters = {
    dataPath: "assets/data/data.json",
    numOfPairs: 6,
    pair: 2,
    cardTypes: ["txt","img"],
    secondsInMinute: 60,
};

// get the data using fetch function from the slack CI community
const data = await fetch("assets/data/data.json").then(res => res.json()); 


/**
 * Generate data for image and text cards from the basis data.
 * Returns array containing image data and text data
 */
const generateTextImgDataCards = (selectedBasis) => {
    const selectedImg = []
    const selectedTxt = []

    selectedBasis.forEach((item) => {
        // create data with type of text
        item["type"] = parameters.cardTypes[0];
        selectedTxt.push(item);
        
        // create data with type of img with cloning the item object
        let element = { ... item } // how to clone the object from https://www.freecodecamp.org/news/clone-an-object-in-javascript/
        element["type"] = parameters.cardTypes[1];
        selectedImg.push(element);
    });

    return [selectedImg, selectedTxt];
}


/**
 * Select random cards based on the given number of pairs (numOfCards). 
 * For the game, the numOfCards stays fixed.
 * Returns an object of 6 card pairs (6 images and 6 text).
 */
const selectRandomCards = (numOfPairs) => {
    const shuffledCards = data.sort(() => 0.5 - Math.random());  // shuffle the array elements from https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
    const selectedBasis = shuffledCards.slice(0,numOfPairs);

    // add the type of the card
    const selectedImgTxt = generateTextImgDataCards(selectedBasis);
    const selectedImg = selectedImgTxt[0];
    const selectedTxt = selectedImgTxt[1];

    // put img cards and txt cards together and shuffle the array again
    const shuffled = selectedTxt.concat(selectedImg)
    const shuffledData = shuffled.sort(() => 0.5 - Math.random());
    return shuffledData;
};


/**
 * Add the attributes to the cards elements
 */
const addCardAttributes = ((card, cardFront, cardBack, cardData, index ) => {
    card.classList.add('card');
    card.dataset.key = cardData.id;
    card.id = `card-${index}`;
    cardFront.classList.add('card__front');
    cardBack.classList.add('card__back');
})

/**
 * Add the content to the front of the card from the card data,
 * depending on the type of cards (i.g. img or txt).
 */
const addCardContent = ((cardFront, cardData) => {
    if (cardData.type === parameters.cardTypes[0]) {
        cardFront.innerHTML = `<p class="card__txt"> ${cardData.text} </p>`;
    }       
    else if (cardData.type === parameters.cardTypes[1]){
        cardFront.innerHTML = `<div class="card__img"><img class="img" src="${cardData.img}"></div>`;
        console.log(cardFront)
    }else{
        console.warn('not implemented for such type');
    }
});

/**
 * Generate the board layout and content for 
 * the given number of cards (see electRandomCards())
 * 
 */
const generateBoard = () => {
    const gameBoard = document.querySelector(".game__board");
    const cardsData = selectRandomCards(parameters.numOfPairs);

    cardsData.forEach(function callback(value, index){
        // create the card html elements
        const card = document.createElement('div');
        const cardFront = document.createElement('div');
        const cardBack = document.createElement('div');

        // add attributes and classes
        addCardAttributes(card,cardFront, cardBack, value, index);
        // add the content to the cards based on the type
        addCardContent(cardFront, value);

        //insert the html elements in DOM
        gameBoard.append(card);
        card.append(cardFront);
        card.append(cardBack);
    });

};

generateBoard();


/** *********************************
 *          GAME START
 ************************************ */
const cardsModal = document.querySelector(".card__modal");
const cards = document.querySelectorAll(".card");
cards.forEach(card => card.addEventListener('click',flipCard));
cardsModal.addEventListener('click', closeCardsModal);


let flipedCard = false;
let freezBoard = false;
let firstCard;
let secondCard;

let totalFlips = 0;
let correctFlips = 0;


// code inspiration from https://www.youtube.com/watch?v=ZniVgo8U7ek
function flipCard(){    
    if (freezBoard) return;

    this.classList.add('flip');
    let cardContent = this.children[0].children[0];
    
    if(!flipedCard){
        // the first card has fliped
        flipedCard = true;
        firstCard = this;
        showCardsModal(cardContent);
        console.log('first');
        // closeCardsModal();
        
    }else{
        // the second card has fliped
        flipedCard = false;
        secondCard = this;
        console.log('second');
        // check for match 
        checkCardsMatch(cardContent);
    }
    totalFlips++;
    displayFlips();
    
}

function showCardsModal(cardContent){
    setTimeout(()=>{
        // show the pop up window
        cardsModal.classList.add('active');
        
        const modalContent = cardContent.cloneNode(true);
        const isText = modalContent.classList.contains('card__txt');
        console.log(isText,modalContent.classList);
        const classToAdd = isText ? 'card__modal--txt' : 'card__modal--img'

        modalContent.classList.add('card__modal--large');
        cardsModal.appendChild(modalContent);
        cardsModal.classList.add(classToAdd);
        script.MakeBackgroundDark();

    },800);

}


function closeCardsModal(){
        console.log('onclick closes modal');
        // remove the active class to close the modal
        cardsModal.classList.remove('active');
        // remove type card specific classes
        cardsModal.classList.forEach(item => {
            console.log('is img modal class',item.includes('img'),item);
            if (item.includes(parameters.cardTypes[0])){
                cardsModal.classList.remove('card__modal--txt'); 
            }else if(item.includes(parameters.cardTypes[1])){
                cardsModal.classList.remove('card__modal--img'); 
            }else{
                console.info('not implemented');
            }
        });
        // activate the background again
        script.MakeBackgroundNormal();
        // remove the conent of the modal
        cardsModal.innerHTML='';  

        let toComparewith = typeof secondCard === 'undefined'? '': secondCard.dataset.key;
        console.log('toComparewith',Boolean(toComparewith), toComparewith,'versus' ,firstCard.dataset.key);
        console.log(firstCard,secondCard);
       
        if ((firstCard.dataset.key !== toComparewith ) && toComparewith){
            console.log('flip back');
            flipCardsBack();  
        }else{
            secondCard = undefined;
        }

       
}

function checkCardsMatch(cardContent){
    //if clicked on the same card
    if(firstCard.id === secondCard.id){
        firstCard.classList.remove('flip');
        totalFlips--;
    // if clicked on the matched card
    }else if(firstCard.dataset.key === secondCard.dataset.key){
        showCardsModal(cardContent);
        keepCardsFliped(); 
        correctFlips++;
    // no match
    }else{
        console.log('no match');
        showCardsModal(cardContent);
        
    }
    showWinBoard();
    
};

function keepCardsFliped(){
    firstCard.removeEventListener('click',flipCard);
    secondCard.removeEventListener('click',flipCard);
}

function flipCardsBack(){
    console.log('flip cards back')
    freezBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        freezBoard = false;
        secondCard = undefined;
    }, 800);

}


/**
 * Display the number of fliped card
 */
function displayFlips(){
    let textFlips = document.getElementById('total-flips');
    textFlips.innerText = `${totalFlips}`;
}

/**
 * Display the timer
 */
let timeSecond = 0;
const textTime = document.getElementById('total-time');

let getTime = setInterval(function(){
    timeSecond++;
    let seconds = (timeSecond % parameters.secondsInMinute).toString().padStart(2,'0');
    let minutes = (Math.floor(timeSecond / parameters.secondsInMinute)).toString().padStart(2,'0');
    textTime.innerText = `${minutes}:${seconds}`;

},1200);


/**
 * Display win board
 */
function showWinBoard(){
    const totalNumberCards = cards.length / 2;
    const winBoard = document.querySelector(".win-board");
    const winBoardTime = document.querySelector("#win-board__time");
    const winBoardFlips = document.querySelector("#win-board__flips");


    if (totalNumberCards === correctFlips){
        clearInterval(getTime);
        
        const time = document.querySelector("#total-time").innerText;
        const flips = document.querySelector("#total-flips").innerText;
                
        winBoardTime.innerText = time;
        winBoardFlips.innerText = flips;

        winBoard.classList.add('active');
        setTimeout(() => {
            winBoard.classList.remove('active');
            // remove the pop up window of the last card
            cardsModal.classList.remove('active');
            script.MakeBackgroundNormal();
        },3500);

        
    }
    ;
}
