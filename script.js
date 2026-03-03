let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 15;

function startQuiz(){
    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;
    const name = document.getElementById("playerName").value;

    if(name.trim() === ""){
        alert("Enter your name");
        return;
    }

    fetch(`https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`)
        .then(res=>res.json())
        .then(data=>{
            questions = data.results;
            document.getElementById("setupScreen").classList.add("hidden");
            document.getElementById("quizScreen").classList.remove("hidden");
            loadQuestion();
        });
}

function loadQuestion(){
    clearInterval(timer);
    timeLeft = 15;
    document.getElementById("time").innerText = timeLeft;

    const q = questions[currentQuestion];
    document.getElementById("question").innerHTML = q.question;

    const options = [...q.incorrect_answers, q.correct_answer];
    options.sort(()=>Math.random()-0.5);

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    options.forEach(option=>{
        const div = document.createElement("div");
        div.classList.add("option");
        div.innerHTML = option;
        div.onclick = ()=>selectOption(option);
        optionsDiv.appendChild(div);
    });

    document.getElementById("progressBar").style.width = 
        ((currentQuestion)/questions.length)*100 + "%";

    timer = setInterval(()=>{
        timeLeft--;
        document.getElementById("time").innerText = timeLeft;
        if(timeLeft === 0) nextQuestion();
    },1000);
}

function selectOption(selected){
    if(selected === questions[currentQuestion].correct_answer){
        score++;
    }
    nextQuestion();
}

function nextQuestion(){
    currentQuestion++;
    if(currentQuestion < questions.length){
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult(){
    clearInterval(timer);
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("resultScreen").classList.remove("hidden");

    const name = document.getElementById("playerName").value;
    const resultScreen = document.getElementById("resultScreen");

    resultScreen.innerHTML = `
        <h2>${name}, Your Score: ${score}/${questions.length}</h2>
        <button onclick="saveScore()">Save Score</button>
        <button onclick="location.reload()">Play Again</button>
    `;
}

function saveScore(){
    const name = document.getElementById("playerName").value;
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({name,score});
    leaderboard.sort((a,b)=>b.score-a.score);
    leaderboard = leaderboard.slice(0,5);
    localStorage.setItem("leaderboard",JSON.stringify(leaderboard));
    loadLeaderboard();
}

function loadLeaderboard(){
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const list = document.getElementById("leaderboardList");
    list.innerHTML="";
    leaderboard.forEach(player=>{
        list.innerHTML += `<li>${player.name} - ${player.score}</li>`;
    });
}

loadLeaderboard();