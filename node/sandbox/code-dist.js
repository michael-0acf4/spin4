/**
 * Usage
 * node code-dist filename_a filename_b
 * This program compares the source code and ignore irrelevant strings
 */
const fs = require ('fs');
 
const [, , fa, fb] = process.argv;
const [cta, ctb] = [fa, fb].map (
	name => fs.readFileSync (name)
			.toString()
			.replace(/[ \n\t\r]+|"(.*?)"/gi, '')
);

function dist (a, b) {
	const u = a.length;
	const v = b.length;
	const dp = [];
	for (let k = - 1; k < u; k++) {
		dp[k] = [];
		dp[k][-1] = k + 1;
	}

	for (let j = - 1; j < v; j++) 
		dp[-1][j] = j + 1;
	for (let k = 0; k < u; k++) {
		for (let j = 0; j < v; j++) {
			let cost = (a.charAt(k) == b.charAt(j)) ? 0 : 1;
			dp[k][j] = Math.min(
				Math.min(
					1 + dp[k][j - 1], 
					1 + dp[k - 1][j]
				), 
				cost + dp[k - 1][j - 1]
			);
		}
	}
	return dp[u - 1][v - 1];
}

console.log('Levenshtein distance =', dist(cta, ctb));
console.log('code_a =', cta);
console.log('code_b =', ctb);