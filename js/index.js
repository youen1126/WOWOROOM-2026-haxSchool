const apiPath = "youen";

const apiUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/`;
const apiGetProductUrl = `${apiUrl}products`;
const apiGetCartsList = `${apiUrl}carts`;
const apiSendOrder = `${apiUrl}orders`;

//DOM
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCartTableBody = document.querySelector(
  ".shoppingCart-table tbody",
);
const shoppingTotalPrice = document.querySelector(".totalPrice");
const discardAllBtn = document.querySelector(".discardAllBtn");
const materialIcons = document.querySelector(".material-icons");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const sellingText = document.querySelector(".sellingText");
//表單 DOM
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderInfoForm = document.querySelector(".orderInfo-form");

//暫存取得的api資料
let productData = [];
let cartsData = [];
let finalTotal = 0;

init(); //初始化渲染
function init() {
  apiGetProduct();
  apiGetCarts();
}

//api 取得產品列表(含renderProductList(data))
function apiGetProduct() {
  axios
    .get(apiGetProductUrl)
    .then(function (res) {
      productData = res.data.products;
      renderProductList(productData);
      Toast.fire({
        icon: "success",
        title: "商品資料載入成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message,
      });
    });
}
//「渲染」產品列表
function renderProductList(data) {
  let str = "";
  data.forEach(function (item) {
    str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src=${item.images} alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`;
  });
  productWrap.innerHTML = str;
}
//「事件監聽」觸發篩選功能
productSelect.addEventListener("change", function (event) {
  let str = "";
  if (event.target.value === "全部") {
    renderProductList(productData);
  } else {
    productData.forEach(function (item) {
      if (event.target.value === item.category) {
        str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src=${item.images} alt="">
                <a href="#" class="addCardBtn">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>`;
        productWrap.innerHTML = str;
      }
    });
  }
});
//api 加入購物車
function addCart(id) {
  let data = {
    data: {
      productId: id,
      quantity: 1,
    },
  };
  axios
    .post(apiGetCartsList, data)
    .then(function (res) {
      cartsData = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartsList(cartsData);
      Toast.fire({
        icon: "success",
        title: "加入購物車成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message,
      });
    });
}

//「事件監聽」觸發「加入購物車」
productWrap.addEventListener("click", function (event) {
  event.preventDefault();
  const id = event.target.dataset.id;
  if (id) {
    addCart(id);
  }
});
//api 取得購物車列表(含renderCartsList(data))
function apiGetCarts() {
  axios
    .get(apiGetCartsList)
    .then(function (res) {
      cartsData = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartsList(cartsData);
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error,
      });
    });
}

//api 改購物商品數量
function patchApiNum(id, num) {
  let data = {
    data: {
      id: id,
      quantity: num,
    },
  };
  axios
    .patch(apiGetCartsList, data)
    .then(function (res) {
      apiGetCarts();
    })
    .catch(function (error) {
      console.log(error);
    });
}

//「渲染」購物車清單
function renderCartsList(data) {
  let cartsList = "";
  data.forEach(function (item) {
    cartsList += `<tr>
                        <td>
                            <div class="cardItem-title">
                                <img src=${item.product.images} alt="">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${item.product.origin_price}</td>
                        <td>
                        <a href="#"><span class="material-icons cartAmount-icon" data-num="${item.quantity}" data-id="${item.id}">remove</span></a>
                        <span>${item.quantity}</span> 
                        <a href="#"><span class="material-icons cartAmount-icon" data-num="${item.quantity}" data-id="${item.id}">add</span></a>
            </td>
                        <td>NT$${item.product.price}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons" data-id="${item.id}">X</a>
                        </td>
                    </tr>`;
  });
  shoppingCartTableBody.innerHTML = cartsList;
  //檢查購物車是否有商品 綁 「送出」、「購物車沒有商品」、「刪除全品項」按鈕或文字
  if (!cartsData.length) {
    sellingText.style.display = "block";
    discardAllBtn.style.display = "none";
    shoppingTotalPrice.textContent = ``;
    orderInfoBtn.setAttribute("disabled", true);
  } else {
    sellingText.style.display = "none";
    discardAllBtn.style.display = "block";
    shoppingTotalPrice.textContent = `總金額 NT$${finalTotal}`;
    orderInfoBtn.removeAttribute("disabled");
  }
}

//api 刪除購物車

function deleteProductAll() {
  axios
    .delete(apiGetCartsList)
    .then(function (res) {
      cartsData = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartsList(cartsData);
      Toast.fire({
        icon: "success",
        title: "刪除購物車成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message,
      });
    });
}

//「事件監聽」刪除全部按鈕
discardAllBtn.addEventListener("click", function (event) {
  event.preventDefault();
  deleteProductAll();
});

//api 刪除單一商品
function deleteProduct(orderID) {
  axios
    .delete(`${apiGetCartsList}/${orderID}`)
    .then(function (res) {
      cartsData = res.data.carts;
      finalTotal = res.data.finalTotal;
      renderCartsList(cartsData);
      Toast.fire({
        icon: "success",
        title: "刪除商品成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message,
      });
    });
}

// 「事件監聽」刪除單一商品 、 改購物數量
shoppingCartTableBody.addEventListener("click", function (event) {
  event.preventDefault();
  let deleteId = event.target.getAttribute("data-id");
  let num = Number(event.target.getAttribute("data-num"));
  if (event.target.textContent === "X") {
    deleteProduct(deleteId);
  }
  if (event.target.textContent === "add") {
    patchApiNum(deleteId, num + 1);
  }
  if (event.target.textContent === "remove") {
    if (num - 1 < 1) {
      alert("數量不可少於1");
    } else {
      patchApiNum(deleteId, num - 1);
    }
  }
});

// 「訂單填寫區塊」

//填寫購買表單的「事件監聽」
orderInfoBtn.addEventListener("click", function (event) {
  event.preventDefault();
  //預設不顯示「必填」
  customerName.nextElementSibling.style.display = "none";
  customerPhone.nextElementSibling.style.display = "none";
  customerEmail.nextElementSibling.style.display = "none";
  customerAddress.nextElementSibling.style.display = "none";
  //輸入框取值
  const name = customerName.value.trim();
  const tel = customerPhone.value.trim();
  const email = customerEmail.value.trim();
  const address = customerAddress.value.trim();
  const payment = tradeWay.value;
  //檢查輸入框是否為空
  let isError = false;
  if (!name) {
    customerName.nextElementSibling.style.display = "block";
    isError = true;
  }
  if (!tel) {
    customerPhone.nextElementSibling.style.display = "block";
    isError = true;
  }
  if (!email) {
    customerEmail.nextElementSibling.style.display = "block";
    isError = true;
  }
  if (!address) {
    customerAddress.nextElementSibling.style.display = "block";
    isError = true;
  }
  if (!isError) {
    const formData = {
      data: {
        user: {
          name,
          tel,
          email,
          address,
          payment,
        },
      },
    };
    submitOrder(formData);
    Toast.fire({
      icon: "success",
      title: "送出訂單成功！",
    });
  }
});

//api 送出訂單資訊
function submitOrder(formData) {
  axios
    .post(apiSendOrder, formData)
    .then(function (res) {
      orderInfoForm.reset();
      apiGetCarts();
      Toast.fire({
        icon: "success",
        title: "送出訂單成功",
      });
    })
    .catch(function (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message || "送出失敗，請聯繫客服",
      });
    });
}
