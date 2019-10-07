document.addEventListener("DOMContentLoaded", function() {
    let savedItems = [];
    let list = document.querySelector(".item-list");
    let popup = document.querySelector(".popup");
    let form = popup.querySelector("form");
    let dateInput = form.querySelector('#date');
    
    //load saved items if any
    if(localStorage.length) {
        savedItems = JSON.parse(localStorage.getItem('savedItems'));
        
        sortSavedItems();
    }

    //popup opening
    document.querySelector(".ctrl-panel button").addEventListener("click", () => {
        resetForm();

        checkDateInput();

        popup.classList.add('shown');
    });

    //popup closing
    popup.addEventListener("click", closePopup);
    document.querySelector(".btn-close").addEventListener("click", closePopup);    
    document.querySelector(".form-footer .btn-red").addEventListener("click", (e) => { 
        e.preventDefault(); 
        closePopup(); 
    });
    popup.firstElementChild.addEventListener("click", (e) => e.stopPropagation());    

    //date label "placeholder" toggle
    dateInput.addEventListener("change", () => {
        checkDateInput();
    });

    //list item controls
    list.addEventListener("click", (e) => {
        let target = e.target;
        let parent = target.parentElement;
        
        switch(true) {
            case target.classList.contains("btn-red"):
                removeListItem(parent);
                break;

            case target.classList.contains("btn-yellow"):
                preloadItemData(parent);
                break;

            case target.classList.contains("btn-blue"):
                    if(changeListItemStatus(parent)) {
                        target.textContent = "Mark as undone";
                    } else {
                        target.textContent = "Mark as done";
                    }
                break;

            default:
                break;
        }
    });
    
    //form submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let formData = Object.values(form).reduce((obj,field) => { 
            obj[field.name] = field.value;
            return obj;
        }, {});

        formData.isDone = false;

        if(form.querySelector("#itemId").value) {
            editListItem(formData, formData.itemId);
            savedItems[formData.itemId] = formData;
            sortSavedItems();
        } else {
            createListItem(formData, savedItems.push(formData) - 1);
            sortSavedItems();
        }

        localStorage.setItem("savedItems", JSON.stringify(savedItems));

        closePopup();

        form.reset();
    });

    // search handler
    document.getElementById("search").addEventListener("input", (e) => {
        let itemsToShow = savedItems.filter(item => Object.values(item).toString().indexOf(e.target.value) > -1 );

        console.log(itemsToShow);
        [...list.getElementsByClassName("item")].forEach(item => {
            console.log(itemsToShow.includes(item));
            if(!itemsToShow.includes(item.getAttribute("data-id"))) {
                item.style.display = "none";
            } else {
                item.style.display = "inline-block";
            }
        });
        
    });

    function closePopup() {
        popup.animate([
            { opacity: 1 }, 
            { opacity: 0 }
        ], 500).onfinish = () => {
            popup.className = "popup";
            resetForm();
        };
    }

    function resetForm() {
        if(form.querySelector("#itemId")) {
            form.reset();
            form.querySelector(".btn-green").textContent = "Add";
        }
    }

    function checkDateInput() {
        if(dateInput.value) {
            dateInput.nextElementSibling.style.display = "none";
        } else {
            dateInput.nextElementSibling.style.display = "block";
        }
    }

    function createListItem(data, id) {
        if(list.firstElementChild && !list.firstElementChild.classList.contains("item")) {
            list.firstElementChild.remove();
        }

        let newItem = document.createElement("li");
        
        let title = document.createElement("h2");
        title.textContent = data.title;
        newItem.append(title);

        if(data.description) {
            let description = document.createElement("p");
            description.textContent = data.description;

            newItem.append(description);

            description.className = "item-description";
        }

        let priority = document.createElement("p");
        priority.insertAdjacentHTML("afterbegin", `<span>Priority:</span> <span class='${data.priority}'>${data.priority}</span>`);

        newItem.append(priority);

        priority.className = "item-priority";
        
        if(data.date) {
            let deadline = document.createElement("p");
            deadline.textContent = `Deadline: ${data.date}`;

            newItem.append(deadline);        

            deadline.className = "item-deadline";    
        }

        let btnRed = document.createElement("button");
        btnRed.textContent = "Delete";

        let btnYellow = document.createElement("button");
        btnYellow.textContent = "Edit";
        
        let btnBlue = document.createElement("button");
        if(data.isDone) {
            btnBlue.textContent = "Mark as undone";
        } else {
            btnBlue.textContent = "Mark as done";
        }
        
        newItem.append(btnRed);
        newItem.append(btnYellow);
        newItem.append(btnBlue);

        list.append(newItem);

        newItem.setAttribute('data-id', id);

        if(data.isDone) {
            newItem.className = "item item-completed";
        } else {
            newItem.className = "item";
        }
        btnRed.className    = "btn btn-red";
        btnYellow.className = "btn btn-yellow";
        btnBlue.className   = "btn btn-blue float-right";
    }

    
    function editListItem(data, id) {
        let item = list.querySelector(`.item[data-id="${id}"]`);
        
        item.querySelector("h2").textContent = data.title;
        item.querySelector("p.item-priority").innerHTML = `<span>Priority:</span> <span class='${data.priority}'>${data.priority}</span>`;

        let description = item.querySelector("p.item-description");
        if(data.description) {
            if(description) {
                description.textContent = data.description;
            } else {
                description = document.createElement("p");
                description.textContent = data.description;

                item.querySelector("h2").after(description);

                description.className = "item-description";
            }
        } else {
            description.remove();
        }
        
        let date = item.querySelector("p.item-deadline");
        if(data.date) {
            if(date) {
                date.textContent = `Deadline: ${data.date}`;
            } else {
                date = document.createElement("p");
                date.textContent = `Deadline: ${data.date}`;

                item.querySelector("p.item-priority").after(date);

                date.className = "item-deadline";
            }
        } else {
            date.remove();
        }
        
        sortSavedItems();
    }

    function removeListItem(item) {
        savedItems.splice(+item.getAttribute("data-id"), 1);
        localStorage.setItem("savedItems", JSON.stringify(savedItems));

        //resetting ids
        let nextItem = item.nextElementSibling;        
        item.remove();

        while(nextItem) {
            nextItem.setAttribute("data-id", nextItem.getAttribute("data-id") - 1);
            nextItem = nextItem.nextElementSibling;
        }

        if(!list.childElementCount) {
            let textEmpty = document.createElement("li");
            textEmpty.textContent = "There's nothing to do";
            list.append(textEmpty);
        }
    }

    function changeListItemStatus(item) {
        if(item.classList.toggle("item-completed")) {
            savedItems[+item.getAttribute("data-id")].isDone = true;
            sortSavedItems();
            
            return true;
        } else {
            savedItems[+item.getAttribute("data-id")].isDone = false;
            sortSavedItems();
            
            return false;
        }
    }

    function reloadItemList() {
        list.innerHTML = '';

        for (let [index, val] of savedItems.entries()) {
            createListItem(val, index);
        }
    }

    function sortSavedItems() {
        savedItems.sort((a, b) => {
            if(a.isDone && !b.isDone) {
                return 1;
            } else if(b.isDone && !a.isDone) { 
                return -1;
            } else if(a.isDone && b.isDone || (!a.isDone && !b.isDone)) {
                let aPriority = 0;
                let bPriority = 0;
                switch(a.priority) {
                    case "medium":
                        aPriority = 1;
                        break;
                    case "high":
                        aPriority = 2;
                        break;
                }
                switch(b.priority) {
                    case "medium":
                        bPriority = 1;
                        break;
                    case "high":
                        bPriority = 2;
                        break;
                }

                if(aPriority > bPriority) return -1;
                if(aPriority < bPriority) return 1;
                return 0;                
            }
            if(a.isDone) return 1;
            if(b.isDone) return -1;
        });

       localStorage.setItem("savedItems", JSON.stringify(savedItems));

       reloadItemList();
    }
    
    function preloadItemData(item) {
        let itemData = savedItems[+item.getAttribute("data-id")];

        form.querySelector("#itemId").value = item.getAttribute("data-id");
        form.querySelector("#title").value = itemData.title;
        form.querySelector("#description").value = itemData.description;
        form.querySelector("#priority").value = itemData.priority;
        dateInput.value = itemData.date;

        form.querySelector(".btn-green").textContent = "Save";

        checkDateInput();

        popup.classList.add('shown');
    }
});