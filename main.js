const themeSwitcher = document.getElementById("theme-switcher");
const inputField = document.getElementById("input-field");
const listContainer = document.getElementById("list-container");
const itemsLeft = document.getElementById("items-left");
const clearCompleted = document.getElementById("clear-completed");
const filterGrp = document.getElementById("filter-grp");
const radios = document.querySelectorAll("input[type='radio']");
const labels = document.querySelectorAll("label");
const outside = document.getElementById("outside");
const footer = document.getElementById("footer");

const defaultTasks = '[{"id":1740404280167,"title":"Complete online JavaScript course","complete":true},{"id":1740327192915,"title":"Jog around the park 3x","complete":false},{"id":1740404342668,"title":"10 minutes meditation","complete":false},{"id":1740404348905,"title":"Read for 1 hour","complete":false},{"id":1740327099713,"title":"Pick up groceries","complete":false},{"id":1740404303376,"title":"Complete Todo App on Frontend Mentor","complete":false}]';
let mainArray = JSON.parse(localStorage.getItem("tasks") || defaultTasks);

windowResize();
window.addEventListener("resize", windowResize)

let isDocumentLight = localStorage.getItem("theme") == "light";
document.documentElement.classList.toggle("light", isDocumentLight);
themeSwitcher.classList.toggle("light", isDocumentLight);

mainArray.forEach(task => createTask(task));

calcItem();

themeSwitcher.addEventListener("click", () => {
    let isLight = document.documentElement.classList.toggle("light");
    themeSwitcher.classList.toggle("light");
    localStorage.setItem("theme", isLight?"light":"dark");
});

clickOnSpace(themeSwitcher);

inputField.addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
        let value = inputField.value.trim();
        value = value.length > 1?`${value[0].toUpperCase()}${value.slice(1,)}`: value.toUpperCase();

        if (value && value.length <= 50 && !mainArray.find(task => task.title == value)) {
            let task = {
                id: Date.now(),
                title: value,
                complete: false
            };

            mainArray.push(task);
            inputField.value = "";
            createTask(task);
            saveToStorage();
        }
    }
});

listContainer.addEventListener("click", (e) => {
    if (e.target.tagName != "LI") {
        const closestTask = e.target.closest(".main__item");

        if (e.target.tagName == "IMG") {
            mainArray = mainArray.filter(task => task.id != closestTask.dataset.id);
            closestTask.remove();
        } else {
            const isSelected = closestTask.classList.toggle("selected");
            closestTask.dataset.complete = isSelected;
            mainArray.map(task => {
                if (task.id == closestTask.dataset.id) task.complete = isSelected;
            });
        }

        saveToStorage();
        calcItem();
    }
});

let dragItem = null;

listContainer.addEventListener("dragstart", (e) => {
    dragItem = e.target;
    dragItem.classList.add("dragging");
});

listContainer.addEventListener("dragover", (e) => {
    e.preventDefault();

    let afterElement = getDragAfterElement(e.clientY);
    listContainer.insertBefore(dragItem, afterElement);
    saveTheOrder();
});

listContainer.addEventListener("dragend", (e) => {
    dragItem.classList.remove("dragging");
    dragItem = null;
});

clickOnSpace(listContainer);

listContainer.addEventListener("keyup", (e) => {
    if (e.key == "Delete") e.target.querySelector("img").click();
})

clearCompleted.addEventListener("click", () => {
    listContainer.innerHTML = '';

    mainArray = mainArray.filter(task => !task.complete);
    mainArray.forEach(task => createTask(task));
    saveToStorage();

    radios[0].click();
});

radios.forEach(radio => {
    radio.addEventListener("click", () => {
        listContainer.innerHTML = '';
        
        mainArray.forEach(task => {
            let filterItem = radio.parentElement.dataset.filter;
            let isAllowed = filterItem == "active" ? !task.complete : filterItem == "complete" ? task.complete : true;
            
            if (isAllowed) createTask(task);
        })
    });

    clickOnSpace(radio.parentElement);
});

function createTask(task) {
    let li = document.createElement("li");
    li.dataset.id = task.id;
    li.dataset.complete = task.complete;
    li.className = task.complete?"main__item selected":"main__item";
    li.setAttribute("draggable", "true");
    
    let div = document.createElement("div");
    div.className = "main__item__content";
    div.setAttribute("tabindex", "0");

    let circle = document.createElement("div");
    circle.className = "main__item__circle";

    let p = document.createElement("p");
    p.className = "main__item__task";
    p.append(task.title);

    let img = document.createElement("img");
    img.setAttribute("src", "./images/icon-cross.svg");
    img.setAttribute("alt", "Delete Icon to delete the task");
    img.setAttribute("class", "main__item__delete");

    div.append(circle, p, img);
    li.append(div);
    listContainer.append(li);

    calcItem();
};

function calcItem() {
    let number = mainArray.filter(task => !task.complete).length;
    itemsLeft.textContent = `${number || "No"} item${number!=1?"s":""} left`;
};

function saveToStorage() {
    localStorage.setItem("tasks", JSON.stringify(mainArray));
};

function clickOnSpace(element) {
    element.addEventListener("keyup", (e) => {
        if (e.code == "Space" || e.key == "Enter") {
            e.target.click();
        }
    })
};

function windowResize() {
    if (window.matchMedia("(max-width: 500px").matches) {
        outside.append(filterGrp);
    } else {
        footer.append(filterGrp);
        footer.append(clearCompleted);
    }
};

function getDragAfterElement(y) {
    const items = [...document.querySelectorAll('.main__item:not(.dragging)')];
    return items.find(item => {
        const box = item.getBoundingClientRect();
        return y < box.top + box.height / 2;
    })
};

function saveTheOrder() {
    let orderedList = [];
    Array.from(listContainer.children).forEach(child => {
        let item;
        item = mainArray.find(task => task.id == child.dataset.id);
        orderedList.push(item);
    });

    mainArray = orderedList;
    saveToStorage();
}

