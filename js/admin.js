const apiPath = "youen";
const token = "nEzHxE3pLJXk7BuggMOtHAd8JtD3";
const config = {
  headers: { Authorization: token },
};
//API路由：
const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/admin/";
const ordersApiUrl = `${baseUrl}${apiPath}/orders`;

//DOM
const orderPageTable = document.querySelector(".orderPage-table tbody");
const orderStatus = document.querySelector(".orderStatus");
const discardAllBtn = document.querySelector(".discardAllBtn");
//圖表 DOM
const chartBtn = document.querySelector(".chart-space-btn");
const chartContent = document.querySelector(".chartContent");
const cartLoadingText = document.querySelector(".cartLoadingText");
const chartTitle = document.querySelector(".chart-title");

let currentOrders = [];
let currentChartType = "product";

//初始化：
apiGetOrder();

//「渲染」訂單列表 & 圖表渲染
function renderOrders(orders) {
  currentOrders = orders;
  let orderList = "";
  // 遍歷所有消費者送出的訂單
  orders.forEach(function (item, index) {
    //資料轉換成日期格式：
    const orderDate = new Date(item.createdAt * 1000)
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "/");
    // 遍歷訂單中的商品名字：
    let productTitleToList = ""; // 取出「商品title的值」暫存用
    item.products.forEach(function (itemTitle) {
      productTitleToList += `<p>${itemTitle.title}</p>`;
    });
    //判斷「未處理」或「已處理」的顯示：
    let statusText = "未處理";
    if (item.paid === true) {
      statusText = "已處理";
    }
    orderList += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                            ${productTitleToList}
                        </td>
                        <td>${orderDate}</td>
                        <td class="orderStatus">
                            <a href="#" data-id="${item.id}">${statusText}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" value="刪除" data-order-id="${item.id}">
                        </td>
                    </tr>`;
  });

  orderPageTable.innerHTML = orderList;
  // 如果沒有訂單，顯示「沒有訂單」
  noRenderPie(orders);
  if (orders.length === 0) {
    return;
  }
  if (orders.length !== 0) {
    discardAllBtn.classList.remove("disabled");
  } // 啟用「刪除全部按鈕」
  //渲染、切換圖表功能：
  renderCurrentPie();
  cartLoadingText.style.display = "none"; //隱藏文字「圖表載入中....」
}

// 如果沒有訂單，顯示「沒有訂單」
function noRenderPie(orders) {
  if (orders.length === 0) {
    chartContent.innerHTML = `<p class="cartLoadingText">目前沒有訂單可以顯示</p>`;
    discardAllBtn.classList.add("disabled"); // 禁用「刪除全部按鈕」
    return;
  }
}

function renderCurrentPie() {
  if (currentChartType === "product") {
    renderProductPie(currentOrders);
    chartTitle.textContent = "全品項營收比重";
    return;
  }
  renderCategoryPie(currentOrders);
  chartTitle.textContent = "分類品項營收比重";
}

//api 取得訂單

function apiGetOrder() {
  axios
    .get(ordersApiUrl, config)
    .then(function (res) {
      let orders = res.data.orders;
      renderOrders(orders);
      Toast.fire({
        icon: "success",
        title: "載入成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message || "載入失敗",
      });
    });
}

// api 修改訂單狀態
function adjOrder(orderID) {
  let theAdjOne = {
    data: {
      id: orderID,
      paid: true,
    },
  };
  axios
    .put(ordersApiUrl, theAdjOne, config)
    .then(function (res) {
      let orders = res.data.orders;
      renderOrders(orders);
      Toast.fire({
        icon: "success",
        title: "修改成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message || "修改失敗",
      });
    });
}

// api 刪除單一訂單

function deleteOrderItem(id) {
  axios
    .delete(`${ordersApiUrl}/${id}`, config)
    .then(function (res) {
      let orders = res.data.orders;
      renderOrders(orders);
      Toast.fire({
        icon: "success",
        title: "刪除成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message || "刪除失敗",
      });
    });
}

// api 刪除全部訂單

function deleteAll() {
  axios
    .delete(ordersApiUrl, config)
    .then(function (res) {
      let orders = res.data.orders;
      renderOrders(orders);
      Toast.fire({
        icon: "success",
        title: "全部刪除成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message,
      });
    });
}

//「事件監聽」「未處理」「已處理」/ 刪除按鈕
orderPageTable.addEventListener("click", function (event) {
  event.preventDefault();
  //刪除按鈕觸發之後：
  let adjOrderID = "";
  if (event.target.value === "刪除") {
    adjOrderID = event.target.getAttribute("data-order-id");
    deleteOrderItem(adjOrderID);
  }
  //修改訂單按鈕觸發之後要執行的：
  if (event.target.textContent === "已處理") {
    // alert("訂單已不可再修改！");
    Toast.fire({
      icon: "error",
      title: "訂單已不可再修改！",
    });
  }
  if (event.target.textContent === "未處理") {
    adjOrderID = event.target.getAttribute("data-id");
    adjOrder(adjOrderID);
  }
});

//「事件監聽」刪除全部按鈕

discardAllBtn.addEventListener("click", function (event) {
  event.preventDefault();
  if (event.target.textContent === "清除全部訂單") {
    deleteAll();
  }
});

chartBtn.addEventListener("click", function () {
  if (currentOrders.length === 0) {
    return;
  }
  currentChartType = currentChartType === "product" ? "category" : "product";
  renderCurrentPie();
});

//製作（品項分類）圓餅圖的 columns ＆ 丟入 c3 產生器
function renderCategoryPie(data) {
  let categoryObj = {};
  data.forEach(function (item) {
    item.products.forEach(function (item) {
      let category = item.category;
      if (categoryObj[category] === undefined) {
        categoryObj[category] = 1;
      } else {
        categoryObj[category] += 1;
      }
    });
  });

  let newCategoryData = [];
  let category = Object.keys(categoryObj);
  category.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(categoryObj[item]);
    newCategoryData.push(ary);
  });

  let chart = c3.generate({
    bindto: "#chartCategory",
    data: {
      type: "pie",
      columns: newCategoryData,
      colors: {
        窗簾: "#DACBFF",
        床架: "#9D7FEA",
        收納: "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

//製作（全品項）圓餅圖的 columns ＆ 丟入 c3 產生器

function renderProductPie(data) {
  let productObj = {};
  data.forEach(function (item) {
    item.products.forEach(function (item) {
      let productTitle = item.title;
      if (productObj[productTitle] === undefined) {
        productObj[productTitle] = 1;
      } else {
        productObj[productTitle] += 1;
      }
    });
  });

  let newProductData = [];
  let title = Object.keys(productObj);
  title.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(productObj[item]);
    newProductData.push(ary);
  });

  // 丟入 c3 產生器
  let chart = c3.generate({
    bindto: "#chartCategory",
    data: {
      type: "pie",
      columns: newProductData,
    },
  });
}
