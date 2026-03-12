'use client'
import ButtonBack from '@/app/components/ButtonBack'
import React, { useEffect, useState } from 'react'

const CreatePath = () => {
	const [sectors, setSectors] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState('');

	useEffect(() => {
		const base = process.env.NEXT_PUBLIC_API_URL || '';

		fetch(`${base}/api/sectors`)
			.then(res => res.json())
			.then(data => setSectors(Array.isArray(data) ? data : []))
			.catch(err => console.error('Error cargando sectores', err));
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		const form = e.target;
		const fechaReportes = form.fecha_reportes.value;
		const fechaCreada = form.fecha_creada.value;

		const payload = {
			Sectors: form.opciones_sectores.value,
			Fecha: fechaReportes,
			NamePath: form.nombre_ruta.value,
			FechaCreada: fechaCreada,
		};

		setIsSubmitting(true);
		setSubmitMessage('Creando ruta...');

		const base = process.env.NEXT_PUBLIC_API_URL || '';
		fetch(`${base}/api/paths`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
			.then(async res => {
				if (!res.ok) {
					const errorText = await res.text();
					throw new Error(errorText || `Error ${res.status}`);
				}
				return res.json().catch(() => ({}));
			})
			.then(() => {
				setSubmitMessage('Ruta creada correctamente');
			})
			.catch(err => {
				console.error('Error creando ruta', err);
				setSubmitMessage('No se pudo crear la ruta');
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	return (
		<div>
			<div>
				<ButtonBack />
			</div>

			<form onSubmit={handleSubmit} className="flex justify-between items-start gap-9">
				<div className='flex flex-col gap-4 ml-16'>
					<div className='flex gap-6 items-center'>
						<label htmlFor='nombre_ruta' className='w-32'>Nombre Ruta</label>
						<input
							type='text'
							id='nombre_ruta'
							name='nombre_ruta'
							className='bg-[#b2b1b1] rounded-2xl w-40'
							required
						/>
					</div>

					<div className='flex gap-6 items-center'>
						<label htmlFor='opciones_sectores' className='w-32'>Sector</label>
						<select
							name='opciones_sectores'
							id='opciones_sectores'
							className='bg-[#b2b1b1] rounded-2xl w-40'
							required
						>
							<option value=''>Seleccione</option>
							{sectors.map((s, idx) => (
								<option key={idx} value={s.Name_Sector}>{s.Name_Sector}</option>
							))}
						</select>
					</div>

					<div className='flex gap-6 items-center'>
						<label htmlFor='fecha_reportes' className='w-32'>Fecha Reportes</label>
						<input
							type='date'
							id='fecha_reportes'
							name='fecha_reportes'
							className='bg-[#b2b1b1] rounded-2xl w-40'
							required
						/>
					</div>

					<div className='flex gap-6 items-center'>
						<label htmlFor='fecha_creada' className='w-32'>Fecha Creada</label>
						<input
							type='date'
							id='fecha_creada'
							name='fecha_creada'
							className='bg-[#b2b1b1] rounded-2xl w-40'
							required
						/>
					</div>
				</div>

				<div className='flex flex-col gap-3 mr-16'>
					<button
						type='submit'
						disabled={isSubmitting}
						className='w-70 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition'
					>
						{isSubmitting ? 'Creando...' : 'Aceptar'}
					</button>

					<button
						type='button'
						onClick={() => window.history.back()}
						className='w-70 m-auto mt-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition'
					>
						Cancelar
					</button>
				</div>
			</form>

			{submitMessage && <p className='ml-16 mt-4'>{submitMessage}</p>}
		</div>
	)
}

export default CreatePath
