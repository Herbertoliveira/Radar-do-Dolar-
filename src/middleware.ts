import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	// Capturar informações da requisição
	const startTime = Date.now();
	const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	
	// Adicionar headers úteis para logging
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-request-id', requestId);
	requestHeaders.set('x-start-time', startTime.toString());
	
	// Capturar IP real (considerando proxies)
	const forwardedFor = request.headers.get('x-forwarded-for');
	const realIp = request.headers.get('x-real-ip');
	const clientIp = forwardedFor?.split(',')[0] || realIp || request.ip || 'unknown';
	
	requestHeaders.set('x-client-ip', clientIp);
	
	// Criar nova requisição com headers adicionais
	const modifiedRequest = new NextRequest(request, {
		headers: requestHeaders,
	});
	
	// Processar a requisição
	const response = NextResponse.next({
		request: modifiedRequest,
	});
	
	// Adicionar headers de resposta úteis
	response.headers.set('x-request-id', requestId);
	response.headers.set('x-response-time', `${Date.now() - startTime}ms`);
	
	return response;
}

export const config = {
	matcher: [
		// Aplicar a todas as rotas da API
		'/api/:path*',
		// Aplicar a outras rotas se necessário
		// '/((?!_next/static|_next/image|favicon.ico).*)',
	],
};