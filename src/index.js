const txtItemName = document.querySelector("#name");
const txtItemQty = document.querySelector("#qty");
const btnAddEditItem = document.querySelector("#add_edit");
const itemsContainer = document.querySelector(".items-container");
const noDataElement = document.querySelector(".no-data");
const nameValidationSpan = document.querySelector("#name-validation");
const qtyValidationSpan = document.querySelector("#qty-validation");
const increaseButton = document.querySelector(".input-qty-incrementer.increase");
const decreaseButton = document.querySelector(".input-qty-incrementer.decrease");
const headingForm = document.querySelector("#form-heading");

const editIconSrc = "/icons/edit.png";
const deleteIconSrc = "/icons/delete.png";

const groceriesObject = {};

let hasItems = false;
let isEditing = false;

/**
 * Function initalize the value of quantity and load groceryObject from localStorage
 *
 */

const init = () => {
  txtItemQty.value = 1;

  let storedGroceries = JSON.parse(localStorage.getItem("groceriesObject"));

  if (storedGroceries !== undefined || storedGroceries !== null) {
    Object.assign(groceriesObject, storedGroceries);
  }

  Object.keys(groceriesObject).forEach((name) => {
    let qty = groceriesObject[name].qty;
    addNewItem(name, qty);
  });

  updateHasItemsState();
};

/**
 *  Saves the updated groceryObject in localStorage
 */

const updateGroceriesStorage = () => {
  const stringfiedGroceries = JSON.stringify(groceriesObject);
  localStorage.setItem("groceriesObject", stringfiedGroceries);
};

const updateHasItemsState = () => {
  hasItems = Object.keys(groceriesObject).length !== 0;
  noDataElement.style.display = hasItems ? "none" : "flex";
};

const updateEditingState = (state) => {
  isEditing = state;
  txtItemName.disabled = state;

  headingForm.innerHTML = isEditing ? "Edit Grocery Item" : "Add Grocery Item";
  btnAddEditItem.innerHTML = isEditing ? "Edit Item" : "Add Item";
};

const clearForm = () => {
  txtItemName.value = "";
  txtItemQty.value = 1;
};

const createCircularButton = (attr) => {
  let button = document.createElement("button");
  button.classList.add("btn-circle");
  let image = document.createElement("img");

  for (let src in attr) {
    image.setAttribute(src, attr[src]);
  }
  button.append(image);
  return button;
};

const createQuantityContainer = (id) => {
  let qtyDiv = document.createElement("div");
  qtyDiv.classList.add("list-qty");

  let incrementDiv = document.createElement("div");
  incrementDiv.classList.add("increment");

  let decrementDiv = document.createElement("div");
  decrementDiv.classList.add("decrement");

  let counterDiv = document.createElement("div");
  counterDiv.classList.add("counter");
  counterDiv.innerHTML = groceriesObject[id].qty;

  qtyDiv.append(incrementDiv);
  qtyDiv.append(counterDiv);
  qtyDiv.append(decrementDiv);

  incrementDiv.addEventListener("click", () => {
    const newQty = groceriesObject[id].qty + 1;
    groceriesObject[id].qty = newQty;
    updateItem(id, newQty);
  });

  decrementDiv.addEventListener("click", () => {
    const newQty = Math.max(1,groceriesObject[id].qty - 1);
    groceriesObject[id].qty = newQty;
    updateItem(id, newQty);
  });

  return qtyDiv;
};

const createGroceryElement = (name, qty) => {
  let rowDiv = document.createElement("div");
  rowDiv.classList.add("item-row");
  rowDiv.setAttribute("id", name);

  let nameDiv = document.createElement("div");
  nameDiv.classList.add("list-name");
  nameDiv.innerHTML = name;

  let qtyDiv = createQuantityContainer(name);
  rowDiv.append(qtyDiv);

  let actionDiv = document.createElement("div");
  actionDiv.classList.add("list-actions");

  const editImageAttribute = {
    src: editIconSrc,
    width: 24,
    height: 24,
  };

  const deleteImageAttribute = {
    src: deleteIconSrc,
    width: 24,
    height: 24,
  };

  let editButton = createCircularButton(editImageAttribute);
  let deleteButton = createCircularButton(deleteImageAttribute);
  deleteButton.classList.add("btn-danger");

  editButton.addEventListener("click", () => {
    txtItemName.value = name;
    const qty = groceriesObject[name].qty;
    txtItemQty.value = qty;
    updateEditingState(true);
  });

  deleteButton.addEventListener("click", () => deleteItem(name));

  actionDiv.append(editButton);
  actionDiv.append(deleteButton);

  rowDiv.append(nameDiv);
  rowDiv.append(actionDiv);

  return rowDiv;
};

const addNewItem = (name, qty) => {
  const newRow = createGroceryElement(name, qty);
  itemsContainer.append(newRow);
  updateHasItemsState();
};

const updateItem = (name, newQty) => {
  const rowNode = document.getElementById(name);
  const qtyElement = rowNode.querySelector(".counter");
  qtyElement.innerHTML = newQty;
};

const editItem = () => {
  let itemName = txtItemName.value.trim(),
    itemQty = parseInt(txtItemQty.value);
  groceriesObject[itemName].qty = itemQty;

  updateItem(itemName, itemQty);
  updateEditingState(false);
};

const deleteItem = (id) => {
  let itemName = txtItemName.value.trim();

  //If we delete the grocery, we are currently editing
  if (isEditing && id === itemName) {
    updateEditingState(false);
    clearForm();
  }

  const rowElement = document.getElementById(id);
  delete groceriesObject[id];
  rowElement.remove();
  updateHasItemsState();
  updateGroceriesStorage();
};

const saveItem = () => {
  let itemName = txtItemName.value.trim(),
    itemQty = parseInt(txtItemQty.value);

  // Checking if the grocery already exist
  if (groceriesObject.hasOwnProperty(itemName)) {
    const newQty = groceriesObject[itemName].qty + itemQty;
    groceriesObject[itemName].qty = newQty;
    updateItem(itemName, newQty);
  } else {
    const qtyObj = {
      qty: itemQty,
    };
    groceriesObject[itemName] = qtyObj;
    addNewItem(itemName, itemQty);
  }
};

const validateForm = () => {
  const name = txtItemName.value.trim();
  const qty = txtItemQty.value;

  const isNameValid = name.length !== 0;

  nameValidationSpan.innerHTML = isNameValid ? "" : "Name can not be empty";

  const qtyRegex = /^[+]{0,1}[0]*[1-9]\d*$/;
  let isQtyValid = qtyRegex.test(qty);

  qtyValidationSpan.innerHTML = isQtyValid
    ? ""
    : "Quantity should be a number greater than 0";

  return isQtyValid && isNameValid;
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  if (isEditing) {
    editItem();
  } else {
    saveItem();
  }
  clearForm();
  updateGroceriesStorage();
};

btnAddEditItem.addEventListener("click", submitForm);

increaseButton.addEventListener("click", () => {
  let qty = parseInt(txtItemQty.value);
  txtItemQty.value = isNaN(qty) ? 1 : qty + 1;
});

decreaseButton.addEventListener("click", () => {
  let qty = parseInt(txtItemQty.value);
  txtItemQty.value = isNaN(qty) ? 1 : Math.max(1, qty - 1);
});

init();
