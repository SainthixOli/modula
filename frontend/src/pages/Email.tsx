import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logomodula from '../components/assets/logo.png'; 
import mosaicologin from '../components/assets/mosaic.png'; 

const ResetSenhaPage: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error('Por favor, informe um e-mail válido.');
			return;
		}

		try {
			setLoading(true);
			const res = await forgotPassword(email);
			if (res?.data?.success) {
				toast.success('Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.');
				// redireciona para login após curto tempo
				setTimeout(() => navigate('/login'), 1800);
			} else {
				toast('Solicitação enviada. Verifique seu e-mail.');
			}
		} catch (err: any) {
			console.error('Erro ao solicitar recuperação:', err);
			const msg = err?.response?.data?.message || 'Erro ao enviar solicitação. Tente novamente.';
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
			<div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
				<div className="flex items-center justify-center mb-4">
					<img src={logomodula} alt="Módula" className="h-12 mr-3" />
					<h1 className="text-2xl font-semibold">Recuperar senha</h1>
				</div>

				<p className="text-sm text-slate-600 mb-4">Informe o e-mail cadastrado que enviaremos instruções para redefinir sua senha.</p>

				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<Label htmlFor="email">E-mail</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="seu@exemplo.com"
							required
						/>
					</div>

					<div className="flex items-center justify-between">
						<Button type="submit" disabled={loading}>
							{loading ? 'Enviando...' : 'Enviar instruções'}
						</Button>
						<Button variant="ghost" onClick={() => navigate('/login')}>
							Voltar ao login
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ResetSenhaPage;


