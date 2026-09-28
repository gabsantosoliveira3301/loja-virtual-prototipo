// Protótipo portátil: usa localStorage para usuários e produtos (sem npm)

function qs(sel) { return document.querySelector(sel); }

// Storage helpers
function readUsers() {
	try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; }
}
function writeUsers(u){ localStorage.setItem('users', JSON.stringify(u)); }

function readProducts(){
	try { return JSON.parse(localStorage.getItem('products') || '[]'); } catch { return []; }
}
function writeProducts(p){ localStorage.setItem('products', JSON.stringify(p)); }

function seedProducts(){
	const existing = readProducts();
	if (existing.length) return;
	const sample = [
		
	];
	writeProducts(sample);
}

function formatCurrency(v){
	const n = Number(String(v).replace(',','.')) || 0;
	return 'R$ ' + n.toFixed(2).replace('.', ',');
}

// Cart helpers (persistência no localStorage)
function readCart(){
	try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
}
function writeCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
function updateCartCount(){
	const el = qs('#cartCount');
	if (!el) return;
	const cart = readCart();
	const total = cart.reduce((s,i)=>s + (i.qty||1), 0);
	el.textContent = total || '';
}
function addToCart(productId){
	const products = readProducts();
	const p = products.find(x=>Number(x.id)===Number(productId));
	if (!p) return alert('Produto não encontrado');
	const cart = readCart();
	const item = cart.find(x=>Number(x.productId)===Number(productId));
	if (item) item.qty = (item.qty||1) + 1; else cart.push({ productId: Number(productId), qty: 1 });
	writeCart(cart); updateCartCount();
	alert('Produto adicionado ao carrinho');
}


// UI: mostrar usuário online
function setUserUI(){
	const ud = qs('#userDisplay');
	const user = JSON.parse(localStorage.getItem('user')||'null');
	if (!ud) return;
	if (user) {
		ud.innerHTML = `Olá, <strong>${user.name || user.login}</strong> <button id="logoutBtn">Sair</button>`;
		qs('#logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('user'); setUserUI(); loadProducts(); });
	} else {
		ud.innerHTML = `<a href="login.html">Entrar</a>`;
	}
}

// Register with password equality check
const registerForm = qs('#registerForm');
if (registerForm) {
	registerForm.addEventListener('submit', (e)=>{
		e.preventDefault();
		const name = qs('#reg_name').value.trim();
		const login = qs('#reg_login').value.trim();
		const p1 = qs('#reg_password').value;
		const p2 = qs('#reg_password2').value;
		if (!login || !p1) return alert('Login e senha são obrigatórios');
		if (p1 !== p2) return alert('As senhas não coincidem');
		const users = readUsers();
		if (users.find(u=>u.login===login)) return alert('Usuário já existe');
		const user = { id: Date.now(), name, login, password: p1 };
		users.push(user); writeUsers(users);
		localStorage.setItem('user', JSON.stringify({ id: user.id, name: user.name, login: user.login }));
		alert('Cadastro realizado e logado');
		setUserUI();
		registerForm.reset();
		window.location.href = 'produtos.html';
	});
}

// Login local
const loginForm = qs('#loginForm');
if (loginForm) {
	loginForm.addEventListener('submit', (e)=>{
		e.preventDefault();
		const login = qs('#login_login').value.trim();
		const password = qs('#login_password').value;
		const users = readUsers();
		const u = users.find(x=>x.login===login && x.password===password);
		if (!u) return alert('Credenciais inválidas');
		localStorage.setItem('user', JSON.stringify({ id: u.id, name: u.name, login: u.login }));
		setUserUI();
		window.location.href = 'produtos.html';
	});
}

// Product form
const productForm = qs('#productForm');
if (productForm) {
	productForm.addEventListener('submit', (e)=>{
		e.preventDefault();
		const name = qs('#p_name').value.trim();
		const description = qs('#p_desc').value.trim();
		const image = qs('#p_image').value.trim();
		const price = qs('#p_price').value.trim();
		if (!name) return alert('Nome obrigatório');
		const products = readProducts();
		const product = { id: Date.now(), name, description, image, price };
		products.push(product); writeProducts(products);
		productForm.reset(); loadProducts();
	});
}

function createProductCard(p, isLogged){
	const card = document.createElement('div');
	card.className = 'product';
	const img = p.image || 'produto1.png';
	card.innerHTML = `\n    <img src="${img}" alt="${p.name}">\n    <h2>${p.name}</h2>\n    <p class="muted">${p.description}</p>\n    <div class="product-footer">\n      <div class="price">${formatCurrency(p.price)}</div>\n      <div class="product-actions">\n        <button class="addcart" data-id="${p.id}">Adicionar ao Carrinho</button>\n        ${isLogged? `<button class="delete" data-id="${p.id}">Remover</button>`: ''}\n      </div>\n    </div>`;
	return card;
}

function loadProducts(){
	seedProducts();
	const wrap = qs('#productsList');
	if (!wrap) return;
	const products = readProducts();
	if (!products.length) { wrap.innerHTML = '<p>Nenhum produto cadastrado.</p>'; return; }
	wrap.innerHTML = '';
	const user = JSON.parse(localStorage.getItem('user')||'null');
	products.forEach(p=>{
		const card = createProductCard(p, !!user);
		wrap.appendChild(card);
	});
	// add-to-cart handlers
	wrap.querySelectorAll('.addcart').forEach(btn=>{
		btn.addEventListener('click', ()=>{ const id = btn.dataset.id; addToCart(id); });
	});
	// delete handlers
	wrap.querySelectorAll('.delete').forEach(btn=>{
		btn.addEventListener('click', ()=>{
			const id = Number(btn.dataset.id);
			if (!confirm('Remover produto?')) return;
			let products = readProducts(); products = products.filter(x=>x.id!==id); writeProducts(products); loadProducts();
		});
	});
	updateCartCount();
}

// Carrega página de carrinho caso exista elementos específicos
function loadCartPage(){
	const container = qs('#cartItems');
	if (!container) return;
	const cart = readCart();
	const products = readProducts();
	if (!cart.length) { container.innerHTML = '<p>Seu carrinho está vazio.</p>'; qs('#cartTotal') && (qs('#cartTotal').textContent='0.00'); return; }
	container.innerHTML = '';
	let total = 0;
	cart.forEach(ci=>{
		const p = products.find(x=>Number(x.id)===Number(ci.productId));
		if (!p) return;
		const qty = ci.qty || 1;
		const unit = Number(String(p.price||'0').replace(',','.')) || 0;
		const subtotal = unit * qty;
		total += subtotal;
		const row = document.createElement('div'); row.className='cart-row';
		row.innerHTML = `<div class="cart-left"><img src="${p.image||'produto1.jpg'}" alt="${p.name}"></div><div class="cart-mid"><h4>${p.name}</h4><p class="muted">${p.description}</p></div><div class="cart-right"><div class="unit">${formatCurrency(unit)}</div><input type="number" min="1" value="${qty}" class="cart-qty" data-id="${p.id}"><div class="subtotal">${formatCurrency(subtotal)}</div><div><button class="remove-item" data-id="${p.id}">Remover</button></div></div>`;
		container.appendChild(row);
	});
	qs('#cartTotal') && (qs('#cartTotal').textContent = formatCurrency(total));
	// qty change handlers
	container.querySelectorAll('.cart-qty').forEach(inp=>{
		inp.addEventListener('change', ()=>{
			const id = Number(inp.dataset.id); const val = Math.max(1, Number(inp.value)||1);
			const cart = readCart(); const it = cart.find(x=>Number(x.productId)===id); if (it) it.qty = val; writeCart(cart); loadCartPage(); updateCartCount();
		});
	});
	container.querySelectorAll('.remove-item').forEach(btn=>{
		btn.addEventListener('click', ()=>{
			const id = Number(btn.dataset.id);
			let cart = readCart(); cart = cart.filter(x=>Number(x.productId)!==id); writeCart(cart); loadCartPage(); updateCartCount();
		});
	});
}

document.addEventListener('DOMContentLoaded', ()=>{ setUserUI(); loadProducts(); loadCartPage(); updateCartCount();
	const clearBtn = qs('#clearCart');
	if (clearBtn) clearBtn.addEventListener('click', ()=>{ if (!confirm('Limpar todo o carrinho?')) return; writeCart([]); loadCartPage(); updateCartCount(); });
	const checkout = qs('#checkout');
	if (checkout) checkout.addEventListener('click', ()=>{ const cart = readCart(); if (!cart.length) return alert('Carrinho vazio'); // protótipo: apenas limpa
		alert('Compra simulada. Obrigado!'); writeCart([]); loadCartPage(); updateCartCount(); });
});

