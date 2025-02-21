import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function VitaVerseApp() {
 // Stato per i dati della salute
 const [healthData, setHealthData] = useState({
   weight: 70,
   sleepHours: 7,
   energyLevel: 8,
   exercise: 30,
   waterIntake: 2000
 });

 // Stato per il livello e i badge 
 const [badges] = useState([
   { id: 1, name: "Early Bird", achieved: true },
   { id: 2, name: "Workout Warrior", achieved: false },
   { id: 3, name: "Hydration Hero", achieved: true }
 ]);

 // Dati di esempio per il grafico
 const chartData = [
   { day: 'Lun', weight: 70, sleep: 7 },
   { day: 'Mar', weight: 69.8, sleep: 7.5 },
   { day: 'Mer', weight: 69.5, sleep: 8 },
   { day: 'Gio', weight: 69.3, sleep: 6.5 },
   { day: 'Ven', weight: 69.1, sleep: 7 },
 ];

 const handleInputChange = (field, value) => {
   setHealthData(prev => ({
     ...prev,
     [field]: value
   }));
 };

 return (
   <div className="min-h-screen bg-gray-100 p-8">
     <div className="max-w-4xl mx-auto">
       {/* Header */}
       <div className="text-center mb-8">
         <h1 className="text-4xl font-bold text-purple-600 mb-2">VitaVerse</h1>
         <p className="text-gray-600">Il tuo NFT personale per il benessere</p>
         <div className="mt-4">
           <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
             Livello 1
           </span>
         </div>
       </div>

       {/* Dashboard principale */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Metriche Card */}
         <Card>
           <CardHeader>
             <CardTitle>Metriche Giornaliere</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                 <input
                   type="number"
                   value={healthData.weight}
                   onChange={(e) => handleInputChange('weight', e.target.value)}
                   className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Ore di sonno</label>
                 <input
                   type="number"
                   value={healthData.sleepHours}
                   onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                   className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">Livello energia (1-10)</label>
                 <input
                   type="range"
                   min="1"
                   max="10"
                   value={healthData.energyLevel}
                   onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                   className="mt-1 block w-full"
                 />
                 <span className="text-sm text-gray-500">{healthData.energyLevel}</span>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Grafico Card */}
         <Card>
           <CardHeader>
             <CardTitle>Andamento Settimanale</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="day" />
                   <YAxis />
                   <Tooltip />
                   <Line 
                     type="monotone" 
                     dataKey="weight" 
                     stroke="#8884d8" 
                     name="Peso"
                   />
                   <Line 
                     type="monotone" 
                     dataKey="sleep" 
                     stroke="#82ca9d" 
                     name="Ore di sonno"
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
       </div>

       {/* Sezione Badge */}
       <div className="mt-8">
         <Card>
           <CardHeader>
             <CardTitle>I tuoi Badge</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {badges.map(badge => (
                 <div
                   key={badge.id}
                   className={`p-4 rounded-lg text-center ${
                     badge.achieved ? 'bg-green-100' : 'bg-gray-100'
                   }`}
                 >
                   <Badge 
                     size={24} 
                     className={`mx-auto ${badge.achieved ? 'text-green-600' : 'text-gray-400'}`} 
                   />
                   <p className="mt-2 font-medium">{badge.name}</p>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   </div>
 );
}

export default VitaVerseApp;