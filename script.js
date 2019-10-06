document.addEventListener("DOMContentLoaded", function() {
    let savedItems = [];
    let list = document.querySelector(".item-list");
    let popup = document.querySelector(".popup");
    let form = popup.querySelector("form");
    let dateInput = form.querySelector('#date');
    
    //load saved items if any
    if(localStorage.length) {
        savedItems = JSON.parse(localStorage.getItem('savedItems'));

        for (let [index, val] of savedItems.entries()) {
            createListItem(val, index);
        }
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
                if(parent.classList.toggle("item-completed")) {
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

        if(form.querySelector("#itemId")) {
            editListItem(formData, formData.itemId);
            savedItems[formData.itemId] = formData;
        } else {
            createListItem(formData, savedItems.push(formData) - 1);
        }

        localStorage.setItem("savedItems", JSON.stringify(savedItems));

        closePopup();

        form.reset();
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
        if(!list.firstElementChild.classList.contains("item")) {
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
        btnBlue.textContent = "Mark as done";
        
        newItem.append(btnRed);
        newItem.append(btnYellow);
        newItem.append(btnBlue);

        list.append(newItem);

        newItem.setAttribute('data-id', id);

        newItem.className   = "item";
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