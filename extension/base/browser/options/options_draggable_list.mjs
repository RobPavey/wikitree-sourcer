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

function createDraggableListElement(document) {
  let listElement = document.createElement("ul");
  let isDragging = false;
  let activeItem = null;
  let scrollInterval = null;

  // --- COMMON DRAG LOGIC ---
  function handleMove(clientY) {
    const afterElement = getDragAfterElement(listElement, clientY);
    if (afterElement == null) {
      listElement.appendChild(activeItem);
    } else {
      listElement.insertBefore(activeItem, afterElement);
    }
    handleAutoScroll(clientY);
  }

  function handleAutoScroll(clientY) {
    const rect = listElement.getBoundingClientRect();
    const threshold = 40;

    clearInterval(scrollInterval);

    if (clientY < rect.top + threshold) {
      scrollInterval = setInterval(() => {
        listElement.scrollTop -= 12;
      }, 16);
    } else if (clientY > rect.bottom - threshold) {
      scrollInterval = setInterval(() => {
        listElement.scrollTop += 12;
      }, 16);
    }
  }

  function finishDrag() {
    if (!isDragging || !activeItem) return;

    clearInterval(scrollInterval);
    activeItem.classList.remove("beingDragged");

    const event = new Event("change", { bubbles: true });
    listElement.dispatchEvent(event);

    isDragging = false;
    activeItem = null;
  }

  // --- DESKTOP / POINTER EVENTS ---
  function startPointerDrag(e) {
    const listItem = e.target.closest("li.draggableListItem");
    if (!listItem || listItem.parentElement !== listElement) return;

    // On mobile devices/tablets (even when using a mouse/trackpad),
    // restrict pointer dragging strictly to the handle.
    // Allow row-wide dragging only on true desktop environments (mouse-primary browsers).
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) {
      const handle = e.target.closest(".draggableIcon");
      if (!handle) return; // If clicking outside the handle on iOS/iPad, let native scrolling/events happen
    }

    e.preventDefault();

    activeItem = listItem;
    isDragging = true;
    activeItem.classList.add("beingDragged");

    if (e.pointerId) {
      try {
        activeItem.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endPointerDrag);
    window.addEventListener("pointercancel", endPointerDrag);
  }

  function onPointerMove(e) {
    if (!isDragging || !activeItem) return;
    e.preventDefault();
    const clientY = e.clientY;
    if (clientY) handleMove(clientY);
  }

  function endPointerDrag(e) {
    if (!isDragging) return;
    if (e && e.pointerId && activeItem) {
      try {
        activeItem.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endPointerDrag);
    window.removeEventListener("pointercancel", endPointerDrag);
    finishDrag();
  }

  // --- iOS SAFARI / TOUCH EVENTS ---
  function startTouchDrag(e) {
    const handle = e.target.closest(".draggableIcon");
    if (!handle) return;

    const listItem = handle.closest(".draggableListItem");
    if (!listItem || listItem.parentElement !== listElement) return;

    // Immediately stop iOS scrolling and lock gesture to dragging
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling confusion

    activeItem = listItem;
    isDragging = true;
    activeItem.classList.add("beingDragged");

    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", endTouchDrag);
    window.addEventListener("touchcancel", endTouchDrag);
  }

  function onTouchMove(e) {
    if (!isDragging || !activeItem) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) handleMove(touch.clientY);
  }

  function endTouchDrag(e) {
    if (!isDragging) return;
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", endTouchDrag);
    window.removeEventListener("touchcancel", endTouchDrag);
    finishDrag();
  }

  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll("li.draggableListItem:not(.beingDragged)")];

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

  // Attach both pointer events (Chrome/Desktop) and touch events (iOS Safari)
  listElement.addEventListener("pointerdown", startPointerDrag);
  listElement.addEventListener("touchstart", startTouchDrag, { passive: false });

  return listElement;
}

export { createDraggableListElement };
