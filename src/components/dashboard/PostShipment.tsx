import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createShipment } from '../../services/shipment';

type ShipmentFormData = {
  title: string;
  fromCity: string;
  toCity: string;
  deadline: string;
  weight: number;
  volume: string;
  cost: number;
  description: string;
};

type PostShipmentProps = {
  onShipmentCreated: () => void;
};

export default function PostShipment({ onShipmentCreated }: PostShipmentProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShipmentFormData>({defaultValues:{cost: 0.00}});

  const onSubmit = async (data: ShipmentFormData) => {
    try {
      await createShipment(data);
      toast.success('Shipment created successfully');
      reset();
      onShipmentCreated();
    } catch (error) {
      toast.error('Failed to create shipment');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Post a New Shipment</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Shipment Title
          </label>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fromCity" className="block text-sm font-medium text-gray-700">
              From City
            </label>
            <input
              type="text"
              {...register("fromCity", { required: "Origin city is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.fromCity && <p className="mt-1 text-sm text-red-600">{errors.fromCity.message}</p>}
          </div>

          <div>
            <label htmlFor="toCity" className="block text-sm font-medium text-gray-700">
              To City
            </label>
            <input
              type="text"
              {...register("toCity", { required: "Destination city is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.toCity && <p className="mt-1 text-sm text-red-600">{errors.toCity.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Delivery Deadline
          </label>
          <input
            type="date"
            {...register("deadline", { required: "Deadline is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("weight", { required: "Weight is required" })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>}
          </div>

          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
              Volume
            </label>
            <input
              type="text"
              {...register("volume", { required: "Volume is required" })}
              placeholder="e.g., 2x3x4 meters"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.volume && <p className="mt-1 text-sm text-red-600">{errors.volume.message}</p>}
          </div>

          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Cost ((₹))
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("cost", { 
                required: "Cost is required",
                min: { value: 0, message: "Cost cannot be negative" }
              })}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Post Shipment
          </button>
        </div>
      </form>
    </div>
  );
}