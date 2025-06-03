const products = [
    {
        id: 1,
        name: "Bundle 1",
        price: 290.99,
        image: "images/bundle1.png"
    },
    {
        id: 2,
        name: "Bundle 2",
        price: 290.99,
        image: "images/bundle2.png"
    },
    {
        id: 3,
        name: "Bundle 3",
        price: 290.99,
        image: "images/bed.png"
    },
    {
        id: 4,
        name: "Dog Leash",
        price: 199.99,
        image: "images/dog-leash.png"
    },
    {
        id: 5,
        name: "Cat Tower",
        price: 390.99,
        image: "images/catTower.png"
    },
    {
        id: 6,
        name: "Nail Trimmer",
        price: 159.99,
        image: "images/nail-trimmer.png"
    },
    {
        id: 7,
        name: "Aquarium Cleaner", 
        price: 590.99,
        image: "images/fish.png"
    },
    {
        id: 8,
        name: "Bird Cage",
        price: 290.99,
        image: "images/birdcage.png"
    },
    {
        id: 9,
        name: "Pebbles",
        price: 190.99,
        image: "images/pebbles.png"
    },
];
function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('col-md-4');
        productCard.classList.add('mb-4');
        productCard.innerHTML = `
            <div class="product-card card shadow-sm">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="product-info d-flex justify-content-between">
                    <p class="mb-0">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-warning add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        productList.appendChild(productCard);
    });
}
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('add-to-cart')) {
        const productId = parseInt(event.target.dataset.id);
        addToCart(productId);
    }
});
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existingProduct = cart.find(p => p.id === productId);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const cartCount = document.getElementById('cart-count');
    cartCount.innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let totalPrice = 0;

    if (cart.length === 0) {
        document.getElementById('empty-cart').style.display = 'block';
    } else {
        document.getElementById('empty-cart').style.display = 'none';
        cart.forEach(item => {
            totalPrice += item.price * item.quantity;
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item', 'd-flex', 'justify-content-between', 'mb-3');
            cartItem.innerHTML = `
                <div>${item.name} x ${item.quantity}</div>
                <div>$${(item.price * item.quantity).toFixed(2)}</div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    document.getElementById('total-price').innerText = totalPrice.toFixed(2);
}
document.getElementById('checkout-btn').addEventListener('click', function () {
    if (cart.length > 0) {
        alert("Proceeding to checkout!");
        localStorage.removeItem('cart');
        cart = [];
        updateCart();
    } else {
        alert("Your cart is empty!");
    }
});
renderProducts();
updateCart();
