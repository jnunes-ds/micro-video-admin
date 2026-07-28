// Mata processos órfãos do dev server (`nest start --watch` deixa o `dist/main`
// pendurado quando o pai é interrompido, causando EADDRINUSE na porta 3000).
// A imagem do container não tem `ps`/`pkill`, então lemos /proc direto.
const fs = require('fs');

const PATTERN = /dist\/main|@nestjs\/cli/;

if (!fs.existsSync('/proc/self')) {
	// fora do Linux (ex.: rodando no host macOS) não há /proc; nada a fazer
	process.exit(0);
}

for (const pid of fs.readdirSync('/proc').filter((p) => /^\d+$/.test(p))) {
	if (Number(pid) === process.pid) continue;

	let cmdline;
	try {
		cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' ').trim();
	} catch {
		continue; // processo já saiu ou sem permissão
	}

	if (!PATTERN.test(cmdline)) continue;

	console.log(`[kill-dev-server] killing ${pid}: ${cmdline}`);
	try {
		process.kill(Number(pid), 'SIGTERM');
	} catch {
		// já morreu
	}
}
