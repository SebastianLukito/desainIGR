function display1(e) {
	var s = document.getElementById("expression1").value,
		n = s.length - 1;
	0 != check || ")" != s[n] && "!" != s[n] && "π" != s[n] && "e" != s[n] && "²" != s[n] && "%" != s[n] || 0 != e && 1 != e && 2 != e && 3 != e && 4 != e && 5 != e && 6 != e && 7 != e && 8 != e && 9 != e || multiply(), 1 == check && ")" == e ? clr() : (display2(e), display3(e))
}

function display2(e) {
	1 == check && ("0" == e || "1" == e || "2" == e || "3" == e || "4" == e || "5" == e || "6" == e || "7" == e || "8" == e || "9" == e || "(" == e || ")" == e || "sin(" == e || "cos(" == e || "tan(" == e || "log(" == e || "ln(" == e || "π" == e || "e" == e || "√(" == e || "abs(" == e ? clr() : "Error" == expression2 || "NaN" == expression2 ? clr() : check = 0);
	var s = document.getElementById("expression1");
	s.value += e, scroll_right()
}

function display3(e) {
	1 == check && ("0" == e || "1" == e || "2" == e || "3" == e || "4" == e || "5" == e || "6" == e || "7" == e || "8" == e || "9" == e || "(" == e || ")" == e || "sss(" == e || "ccc(" == e || "ttt(" == e || "lll(" == e || "jj(" == e || e == Math.PI || e == Math.E || "√(" == e || "aaa(" == e ? clr() : "Error" == expression2 || "NaN" == expression2 ? clr() : check = 0), expression2 += e, scroll_right()
}

function solve() {
	check = 1;
	var x = document.getElementById("expression1").value,
		o = expression2.indexOf("!");
	if (o > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("!" == expression2[k])
				if (")" == expression2[k - 1]) {
					for (var i = k - 1;
						"(" != expression2[i];) i -= 1;
					if ("." == expression2[i]) {
						var history = document.getElementById("history");
						history.value += "\n" + x + " = Error\nFactorial function is defined for non-negative integers.", document.getElementById("expression1").value = "Error", expression2 = "Error", gfg_Run()
					}
					for (var n = eval(expression2.substring(i, k)), ans = 1, j = 1; j <= n; j++) ans *= j;
					if (expression2 = expression2.substring(0, i) + String(ans) + expression2.substring(k + 1, expression2.length), 1 == ans && 0 != n && 1 != n) {
						var history = document.getElementById("history");
						history.value += "\n" + x + " = Error\nFactorial function is defined for non-negative integers.", document.getElementById("expression1").value = "Error", expression2 = "Error", gfg_Run()
					}
				} else {
					for (var i = k - 1; 0 == expression2[i] || 1 == expression2[i] || 2 == expression2[i] || 3 == expression2[i] || 4 == expression2[i] || 5 == expression2[i] || 6 == expression2[i] || 7 == expression2[i] || 8 == expression2[i] || 9 == expression2[i];) i -= 1;
					if ("." == expression2[i]) {
						var history = document.getElementById("history");
						history.value += "\n" + x + " = Error\nFactorial function is defined for non-negative integers.", document.getElementById("expression1").value = "Error", expression2 = "Error", gfg_Run()
					}
					for (var n = eval(expression2.substring(i + 1, k)), ans = 1, j = 1; j <= n; j++) ans *= j;
					if (expression2 = expression2.substring(0, i + 1) + String(ans) + expression2.substring(k + 1, expression2.length), 1 == ans && 0 != n && 1 != n) {
						var history = document.getElementById("history");
						history.value += "\n" + x + " = Error\nFactorial function is defined for non-negative integers.", document.getElementById("expression1").value = "Error", expression2 = "Error", gfg_Run()
					}
				}
	var p = expression2.indexOf("√");
	if (p > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("√" == expression2[k])
				if ("(" == expression2[k + 1]) {
					for (var i = k + 2;
						")" != expression2[i] && i != expression2.length;) i += 1;
					i == expression2.length && ")" != expression2[i] && (x += ")");
					var n = eval(expression2.substring(k + 2, i)),
						ans = Math.pow(n, .5);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i + 1, expression2.length)
				} else {
					for (var i = k + 1; 0 == expression2[i] || 1 == expression2[i] || 2 == expression2[i] || 3 == expression2[i] || 4 == expression2[i] || 5 == expression2[i] || 6 == expression2[i] || 7 == expression2[i] || 8 == expression2[i] || 9 == expression2[i] || "." == expression2[i];) i += 1;
					var n = eval(expression2.substring(k + 1, i)),
						ans = Math.pow(n, .5);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i, expression2.length)
				}
	var q = expression2.indexOf("s");
	if (q > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("s" == expression2[k])
				if ("(" == expression2[k + 3]) {
					for (var i = k + 4;
						")" != expression2[i] && i != expression2.length;) i += 1;
					i == expression2.length && ")" != expression2[i] && (x += ")");
					var n = eval(expression2.substring(k + 4, i)),
						ans = Math.sin(n / 180 * Math.PI);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i + 1, expression2.length)
				} else {
					for (var i = k + 3; 0 == expression2[i] || 1 == expression2[i] || 2 == expression2[i] || 3 == expression2[i] || 4 == expression2[i] || 5 == expression2[i] || 6 == expression2[i] || 7 == expression2[i] || 8 == expression2[i] || 9 == expression2[i] || "." == expression2[i];) i += 1;
					var n = eval(expression2.substring(k + 3, i)),
						ans = Math.sin(n / 180 * Math.PI);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i, expression2.length)
				}
	var r = expression2.indexOf("c");
	if (r > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("c" == expression2[k])
				if ("(" == expression2[k + 3]) {
					for (var i = k + 4;
						")" != expression2[i] && i != expression2.length;) i += 1;
					i == expression2.length && ")" != expression2[i] && (x += ")");
					var n = eval(expression2.substring(k + 4, i)),
						ans = Math.cos(n / 180 * Math.PI);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i + 1, expression2.length)
				} else {
					for (var i = k + 3; 0 == expression2[i] || 1 == expression2[i] || 2 == expression2[i] || 3 == expression2[i] || 4 == expression2[i] || 5 == expression2[i] || 6 == expression2[i] || 7 == expression2[i] || 8 == expression2[i] || 9 == expression2[i] || "." == expression2[i];) i += 1;
					var n = eval(expression2.substring(k + 3, i)),
						ans = Math.cos(n / 180 * Math.PI);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i, expression2.length)
				}
	var s = expression2.indexOf("t");
	if (s > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("t" == expression2[k])
				if ("(" == expression2[k + 3]) {
					for (var i = k + 4;
						")" != expression2[i] && i != expression2.length;) i += 1;
					i == expression2.length && ")" != expression2[i] && (x += ")");
					var n = eval(expression2.substring(k + 4, i));
					if (n % 90 == 0 && n % 180 != 0) {
						expression2 = 1 / 0, document.getElementById("expression1").value = 1 / 0;
						var history = document.getElementById("history");
						history.value += "\n" + x + " = " + expression2, gfg_Run()
					} else {
						var ans = Math.tan(n / 180 * Math.PI);
						expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i + 1, expression2.length)
					}
				} else {
					for (var i = k + 3; 0 == expression2[i] || 1 == expression2[i] || 2 == expression2[i] || 3 == expression2[i] || 4 == expression2[i] || 5 == expression2[i] || 6 == expression2[i] || 7 == expression2[i] || 8 == expression2[i] || 9 == expression2[i] || "." == expression2[i];) i += 1;
					var n = eval(expression2.substring(k + 3, i));
					if (n % 90 == 0 && n % 180 != 0) {
						expression2 = 1 / 0, document.getElementById("expression1").value = 1 / 0;
						var history = document.getElementById("history");
						history.value += "\n" + x + " = " + expression2, gfg_Run()
					} else {
						var ans = Math.tan(n / 180 * Math.PI);
						expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i, expression2.length)
					}
				}
	var t = expression2.indexOf("l");
	if (t > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("l" == expression2[k])
				if ("(" == expression2[k + 3]) {
					for (var h = k + 4;
						")" != expression2[h] && h != expression2.length;) h += 1;
					h == expression2.length && ")" != expression2[h] && (x += ")");
					var n = eval(expression2.substring(k + 4, h)),
						ans = Math.log10(n);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(h + 1, expression2.length)
				} else {
					for (var h = k + 3; 0 == expression2[h] || 1 == expression2[h] || 2 == expression2[h] || 3 == expression2[h] || 4 == expression2[h] || 5 == expression2[h] || 6 == expression2[h] || 7 == expression2[h] || 8 == expression2[h] || 9 == expression2[h] || "." == expression2[h];) h += 1;
					var n = eval(expression2.substring(k + 3, h)),
						ans = Math.log10(n);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(h, expression2.length)
				}
	var u = expression2.indexOf("j");
	if (u > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("j" == expression2[k])
				if ("(" == expression2[k + 2]) {
					for (var i = k + 3;
						")" != expression2[i] && i != expression2.length;) i += 1;
					i == expression2.length && ")" != expression2[i] && (x += ")");
					var n = eval(expression2.substring(k + 3, i)),
						ans = Math.log(n);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i + 1, expression2.length)
				} else {
					for (var i = k + 2; 0 == expression2[i] || 1 == expression2[i] || 2 == expression2[i] || 3 == expression2[i] || 4 == expression2[i] || 5 == expression2[i] || 6 == expression2[i] || 7 == expression2[i] || 8 == expression2[i] || 9 == expression2[i] || "." == expression2[i];) i += 1;
					var n = eval(expression2.substring(k + 2, i)),
						ans = Math.log(n);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i, expression2.length)
				}
	var v = expression2.indexOf("a");
	if (v > -1)
		for (var k = 0; k < expression2.length; k++)
			if ("a" == expression2[k])
				if ("(" == expression2[k + 3]) {
					for (var i = k + 4;
						")" != expression2[i] && i != expression2.length;) i += 1;
					i == expression2.length && ")" != expression2[i] && (x += ")");
					var n = eval(expression2.substring(k + 4, i)),
						ans = Math.abs(n);
					expression2 = expression2.substring(0, k) + String(ans) + expression2.substring(i + 1, expression2.length)
				} else {
					document.getElementById("expression1").value = "Error", expression2 = "Error";
					var history = document.getElementById("history");
					history.value += "\n" + x + " = " + expression2 + "\nPlease add parenthesis after abs", gfg_Run()
				}
	if (expression2 != 1 / 0) {
		try {
			var y = eval(expression2)
		} catch (e) {
			let s = checkBalancedParentheses(expression2);
			if (0 === s) {
				expression2 = "Error";
				var history = document.getElementById("history");
				history.value += "\n" + x + " = " + expression2 + "\nError: closing bracket has been used before an opening bracket.", document.getElementById("expression1").value = "Error", gfg_Run()
			} else if (1 === s) {
				expression2 = "Error";
				var history = document.getElementById("history");
				history.value += "\n" + x + " = " + expression2 + "\nError: brackets are not balanced.", document.getElementById("expression1").value = "Error", gfg_Run()
			} else {
				document.getElementById("expression1").value = "Error", expression2 = "Error";
				var history = document.getElementById("history");
				history.value += "\n" + x + " = " + expression2, gfg_Run()
			}
		}
		var z = y.toFixed(10),
			w = parseFloat(z);
		if (temp = w, expression2 = String(w), document.getElementById("expression1").value = expression2, "Error" != expression2) {
			var history = document.getElementById("history");
			history.value += "\n" + x + " = " + expression2, gfg_Run()
		}
	}
}

function checkBalancedParentheses(e) {
	let s = [],
		n = {
			"(": ")",
			"[": "]",
			"{": "}"
		};
	for (let i = 0; i < e.length; i++)
		if ("(" === e[i] || "{" === e[i] || "[" === e[i]) s.push(e[i]);
		else if (")" === e[i] || "}" === e[i] || "]" === e[i]) {
		let r = s.pop();
		if (e[i] !== n[r]) return 0
	}
	return 0 !== s.length ? 1 : 2
}

function back() {
	var e = document.getElementById("expression1").value,
		s = expression2[expression2.length - 2],
		n = expression2[expression2.length - 1],
		i = e[e.length - 2],
		r = e[e.length - 1];
	1 == check || "Error" == expression2 || "NaN" == expression2 ? clr() : "*" == s || "*" == n ? "*" != n && "*" == s && "×" != i && "^" != i ? (expression2 = expression2.substring(0, expression2.length - 3), document.getElementById("expression1").value = e.substring(0, e.length - 1)) : "*" == n || "*" != s || "×" == i && "^" == i ? "*" == n && "*" == s && "^" == r ? (expression2 = expression2.substring(0, expression2.length - 2), document.getElementById("expression1").value = e.substring(0, e.length - 1)) : "*" == n && "*" == s && "×" == r ? (expression2 = expression2.substring(0, expression2.length - 1), document.getElementById("expression1").value = e.substring(0, e.length - 1)) : "*" == n && "*" != s && "×" == r && (expression2 = expression2.substring(0, expression2.length - 1), document.getElementById("expression1").value = e.substring(0, e.length - 1)) : (expression2 = expression2.substring(0, expression2.length - 1), document.getElementById("expression1").value = e.substring(0, e.length - 1)) : "π" == r || "e" == r ? (expression2 = expression2.substring(0, expression2.length - 17), document.getElementById("expression1").value = e.substring(0, e.length - 1)) : (expression2 = expression2.substring(0, expression2.length - 1), document.getElementById("expression1").value = e.substring(0, e.length - 1)), check = 0
}

function clr() {
	document.getElementById("expression1").value = "", expression2 = "", check = 0
}

function allclr() {
	document.getElementById("history").value = "", document.getElementById("expression1").value = "", expression2 = "", check = 0
}

function gfg_Run() {
	var e = document.getElementById("history");
	e.scrollTop = e.scrollHeight
}

function scroll_right() {
	var e = document.getElementById("expression1");
	e.scrollLeft = e.scrollWidth
}

function runtwofunction() {
	solve(), gfg_Run()
}

function answer() {
	document.getElementById("expression1").value += temp, expression2 += temp
}

function pi() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("π"), display3(Math.PI), check = 0
}

function e() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("e"), display3(Math.E), check = 0
}

function power() {
	display2("^"), display3("**"), check = 0
}

function multiply() {
	display2("×"), display3("*"), check = 0
}

function square() {
	display2("²"), display3("**2"), check = 0
}

function squareroot() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("√("), display3("√("), check = 0
}

function factorial() {
	display2("!"), display3("!"), check = 0
}

function percentage() {
	display2("%"), display3("/100"), check = 0
}

function sinfn() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("sin("), display3("sss("), check = 0;
	var n = document.getElementById("history"),
		i = n.value.indexOf("Enter");
	i < 0 && (n.value += "\nMasukan Derajat Sudut", gfg_Run())
}

function cosfn() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("cos("), display3("ccc("), check = 0;
	var n = document.getElementById("history"),
		i = n.value.indexOf("Enter");
	i < 0 && (n.value += "\nMasukan Derajat Sudut.", gfg_Run())
}

function tanfn() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("tan("), display3("ttt("), check = 0;
	var n = document.getElementById("history"),
		i = n.value.indexOf("Enter");
	i < 0 && (n.value += "\nMasukan Derajat Sudut.", gfg_Run())
}

function logfn() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("log("), display3("lll("), check = 0
}

function lnfn() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("ln("), display3("jj("), check = 0
}

function abs() {
	var e = document.getElementById("expression1").value,
		s = e.length - 1;
	0 != check || ")" != e[s] && "!" != e[s] && "π" != e[s] && "e" != e[s] && "²" != e[s] && "%" != e[s] && 0 != e[s] && 1 != e[s] && 2 != e[s] && 3 != e[s] && 4 != e[s] && 5 != e[s] && 6 != e[s] && 7 != e[s] && 8 != e[s] && 9 != e[s] || multiply(), display2("abs("), display3("aaa("), check = 0
}

function exp() {
	display2("×10^"), display3("*10**"), check = 0
}

function keyPressed(e) {
	"1" == e.key ? display1(1) : "2" == e.key ? display1(2) : "3" == e.key ? display1(3) : "4" == e.key ? display1(4) : "5" == e.key ? display1(5) : "6" == e.key ? display1(6) : "7" == e.key ? display1(7) : "8" == e.key ? display1(8) : "9" == e.key ? display1(9) : "0" == e.key ? display1(0) : "." == e.key ? display1(".") : "(" == e.key ? display1("(") : ")" == e.key ? display1(")") : "/" == e.key ? display1("/") : "*" == e.key ? multiply() : "+" == e.key ? display1("+") : "-" == e.key ? display1("-") : "=" == e.key || "Enter" == e.key ? runtwofunction() : "Delete" == e.key || "Backspace" == e.key ? back() : "s" == e.key || "S" == e.key ? sinfn() : "c" == e.key || "C" == e.key ? cosfn() : "t" == e.key || "T" == e.key ? tanfn() : "p" == e.key ? pi() : "!" == e.key ? factorial() : "^" == e.key ? power() : "%" == e.key && percentage()
}
var expression2 = "",
	temp = "",
	check = 0;
document.addEventListener("keydown", keyPressed);