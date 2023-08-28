localStorage.clear();
sessionStorage.clear();
console.log("Storage has been cleared!");

let cancelBtn = document.querySelector('a.layui-layer-btn1');
if (cancelBtn) {
  cancelBtn.click();
}

(function () {
  // Replace the link below with your questionnaire link
  let url = "https://www.wjx.cn/vm/YWe111A.aspx";
  // If the current page is the survey completion page, redirect to the target URL; do not replace the link below
  if (window.location.href.includes("https://www.wjx.cn/wjx/join/complete")) {
    alert("Congratulations! It looks like you have succeeded.\nGolden flowers~~~");
    window.location.href = url;
  }
  let opt;

  // The script can currently handle single-choice (single), multiple-choice (multiple), matrix (matrix), slider (slide),
  // blank (vacant), and scale (scale) type questions, which includes most common question types.

  /**
   * Question Types (Question Number, [Probability for Each Option]) 
   * {"1": [1, 0, 0, 0, 0],.......} represents the ratio of each sub-question in the matrix question,
   * where the meaning of each sub-question's probability is the same as for single-choice questions.
   *
   * Single-choice: single(1, [1, 2, 3, 3]) means for question 1, option A is selected with a probability of 1/(1+2+3),
   * option B with 2/6, and option C with 3/6.
   *
   * Multiple-choice: multiple(2, [50, 10, 100, 10]) means for question 2, 50% select option A, 10% select option B,
   * and 100% select option C.
   *
   * Blank: vacant(3, [1, 1], ["lzm", "zty"]) means for question 3, the ratio of filling in "lzm" and "zty" is 1:1.
   *
   * Slider: slide(7, 50, 70) means for question 7, the score is between 50 and 70.
   */

  single(1, [1, 2, 3, 3]);
  single(2, [1, 2, 3, 3]);
  single(3, [1, 2]);
  multiple(4, [50, 10, 100, 10]);
  multiple(5, [50, 10, 100, 10]);
  single(6, [1, 2]);
  multiple(7, [50, 10, 100, 10]);
  single(8, [1, 2]);
  single(9, [1, 2, 3, 3]);
  multiple(10, [50, 10, 100, 10]);
  multiple(11, [50, 10, 100, 10]);
  multiple(12, [50, 10, 100, 10]);
  multiple(13, [50, 10, 100, 10]);
  vacant(14, ["Very good", "Good"], [1, 1]);

  // Do not delete any code below; you can only modify the link to your questionnaire and the logic for answering questions.

  // Scroll to the bottom of the page
  window.scrollTo(0, document.body.scrollHeight);
  submit();
  async function submit() {
    // Click the confirmation button after a 1-second delay
    await new Promise((resolve) => {
      setTimeout(() => {
        // Click the submit button
        const nextBtn = document.evaluate('//*[@id="ctlNext"]', document, null,
          XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (nextBtn) {
          nextBtn.click();
          resolve();
        }
      }, 5000);
    });
    // Click the confirmation button after a 1-second delay
    await new Promise((resolve) => {
      setTimeout(() => {
        document.querySelector('.layui-layer-btn0').click();
        resolve();
      }, 1000);
    });
    // Click the verification button after a 2-second delay
    await new Promise((resolve) => {
      setTimeout(() => {
        document.querySelector('#rectMask').click();
        resolve();
      }, 2000);
    });
    // Execute the simulateSliderVerification function after a 4-second delay
    await new Promise((resolve) => {
      setTimeout(() => {
        simulateSliderVerification();
        resolve();
      }, 4000);
    });
  }
  // Slider verification function
  async function simulateSliderVerification() {
    const slider = document.querySelector('#nc_1__scale_text > span');
    console.log("slider", slider);
    if (slider.textContent.startsWith('Please hold the slider')) {
      const width = slider.offsetWidth;
      const eventOptions = { bubbles: true, cancelable: true };
      const dragStartEvent = new MouseEvent('mousedown', eventOptions);
      const dragEndEvent = new MouseEvent('mouseup', eventOptions);
      const steps = 10;
      const stepWidth = width / steps;
      let currX = stepWidth / 2;
      slider.dispatchEvent(dragStartEvent);
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      for (let i = 0; i < steps; i++) {
        slider.dispatchEvent(new MouseEvent('mousemove', Object.assign({ clientX: currX }, eventOptions)));
        currX += stepWidth;
        await delay(50);
      }
      slider.dispatchEvent(dragEndEvent);
      console.log("Slider has been slid");
    }
  }
  // Next page
  function nextPage() {
    document.querySelector('a.button.mainBgColor').click();
  }
  // Single-choice question function
  function single(current, ratio) {
    current = current - 1;
    let lists = document.querySelectorAll('.field.ui-field-contain');
    // Options for this single-choice question
    let ops = lists[current].getElementsByClassName('ui-controlgroup')[0].children;
    ratio = normArray(ratio);
    let index = singleRatio([1, ops.length], ratio);
    ops[index - 1].click();
    console.log("For question", current + 1, "selected option", index);
    return index;
  }
  // Multiple-choice question function
  function multiple(current, ratio) {
    current = current - 1;
    let lists = document.querySelectorAll('.field.ui-field-contain');
    // Options for this multiple-choice question
    let ops = lists[current].getElementsByClassName('ui-controlgroup column1')[0].children;
    let mul_list = [];
    // Get a list of random numbers
    function getRandomNumberList(ratio, mul_list) {
      return ratio.map((item) => Math.random() < item / 100 ? 1 : 0);
    }
    while (mul_list.reduce((acc, curr) => acc + curr, 0) <= 0) {
      mul_list = getRandomNumberList(ratio, mul_list);
    }
    for (const [index, item] of mul_list.entries()) {
      if (item == 1) {
        ops[index].click();
        console.log("For question", current + 1, "selected option", index + 1);
      }
    }
  }

  // Matrix question function
  function matrix(current, matrix_prob) {
    const xpath1 = `//*[@id="divRefTab${current}"]/tbody/tr`;
    const a = document.evaluate(xpath1, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    let q_num = 0;
    // Iterate through each item to determine if it's a question
    for (let i = 0; i < a.snapshotLength; i++) {
      const tr = a.snapshotItem(i);
      if (tr.getAttribute("rowindex") !== null) {
        q_num++;
      }
    }
    const xpath2 = `//*[@id="drv${current}_1"]/td`;
    const b = document.evaluate(xpath2, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    // Number of options in the matrix question
    const optionCount = b.snapshotLength - 1;
    // Convert the nested arrays
    const matrix_arrays = Object.values(matrix_prob);
    // Iterate through each array and normalize it
    const normalizedArrays = matrix_arrays.map((arr) => {
      return normArray(arr);
    });
    for (let i = 1; i <= q_num; i++) {
      // Generate a random number between [2, optionCount]
      let opt = singleRatio([2, optionCount + 1], normalizedArrays[i - 1]);
      let nthElement = document.querySelectorAll(`#drv${current}_${i} td`)[opt - 1];
      nthElement.click();
    }
  }

  function scale(current, ratio) {
    let xpath = `//*[@id="div${current}"]/div[2]/div/ul/li`;
    let a = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    let b = singleRatio([1, a.snapshotLength], ratio);
    let element = document.querySelector(`#div${current} > div.scale-div > div > ul > li:nth-child(${b})`);
    element.click();
    console.log("For question", current, "selected option", b);
    return b;
  }

  function slide(current, min, max) {
    let score = randint(min, max);
    document.querySelector(`#q${current}`).value = score;
    console.log("For question", current, "entered score", score);
  }

  // Blank question function
  function vacant(current, texts, ratio) {
    let text_index = singleRatio([0, texts.length - 1], ratio);
    document.querySelector(`#q${current}`).value = texts[text_index];
    console.log("For question", current, "entered", texts[text_index]);
  }

  function normArray(arr) {
    const sum = arr.reduce((accum, val) => accum + val, 0);
    return arr.map(val => val / sum);
  }

  function singleRatio(range, ratio) {
    let weight = [];
    let sum = 0;
    for (let i = range[0]; i <= range[1]; i++) {
      sum += ratio[i - range[0]];
      weight.push(sum);
    }
    const rand = Math.random() * sum;
    for (let i = 0; i < weight.length; i++) {
      if (rand < weight[i]) {
        return i + range[0];
      }
    }
  }

  function randint(a, b) {
    return Math.floor(Math.random() * (b - a + 1) + a);
  }
})();
