/*
MIT License

Copyright (c) 2022 Robert M Pavey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Code based on this page:
// https://www.geeksforgeeks.org/create-a-drag-and-drop-sortable-list-using-html-css-javascript/

let draggedItem = null;
let startingAfterElement = null;

function touchHandler(event) {
  console.log("touchHandler called, event is:");
  console.log(event);

  // stop the scroll from happening
  event.preventDefault();

  var touches = event.changedTouches,
    first = touches[0],
    type = "";
  switch (event.type) {
    case "touchstart":
      type = "mousedown";
      break;
    case "touchmove":
      type = "mousemove";
      break;
    case "touchend":
      type = "mouseup";
      break;
    default:
      return;
  }

  const simulatedEvent = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    screenX: first.screenX,
    screenY: first.screenY,
    clientX: first.clientX,
    clientY: first.clientY,
    button: 0, // Left mouse button
  });

  console.log("touchHandler called, simulatedEvent is:");
  console.log(simulatedEvent);

  console.log("touchHandler called, first.target is:");
  console.log(first.target);

  first.target.dispatchEvent(simulatedEvent);
}

function createDraggableListElement(document, option) {
  let listElement = document.createElement("ul");

  listElement.addEventListener("dragstart", (e) => {
    console.log("dragStart");
    draggedItem = e.target;
    startingAfterElement = draggedItem.nextElementSibling;
    setTimeout(() => {
      //e.target.style.display = "none";
      e.target.classList.add("beingDragged");
    }, 0);
  });

  listElement.addEventListener("dragend", (e) => {
    console.log("dragEnd");
    setTimeout(() => {
      //e.target.style.display = "";
      e.target.classList.remove("beingDragged");
      draggedItem = null;
    }, 0);
    if (e.dataTransfer.dropEffect == "none") {
      // the drag was cancelled, put it back
      if (startingAfterElement == null) {
        listElement.appendChild(draggedItem);
      } else {
        listElement.insertBefore(draggedItem, startingAfterElement);
      }
    } else {
      // trigger a change event so that the options are saved
      //console.log("createDraggableListElement: dispatching change event");
      const event = new Event("change", { bubbles: true });
      listElement.dispatchEvent(event);
    }
  });

  listElement.addEventListener("dragover", (e) => {
    console.log("dragover");

    e.preventDefault();
    const afterElement = getDragAfterElement(listElement, e.clientY);
    const currentElement = document.querySelector(".dragging");
    if (afterElement == null) {
      listElement.appendChild(draggedItem);
    } else {
      listElement.insertBefore(draggedItem, afterElement);
    }
  });

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return {
            offset: offset,
            element: child,
          };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
      }
    ).element;
  };

  /*
  Attemp to make it work on iPad - not working

  listElement.addEventListener("touchstart", touchHandler, true);
  listElement.addEventListener("touchmove", touchHandler, true);
  listElement.addEventListener("touchend", touchHandler, true);
  listElement.addEventListener("touchcancel", touchHandler, true);
*/

  return listElement;
}

export { createDraggableListElement };
