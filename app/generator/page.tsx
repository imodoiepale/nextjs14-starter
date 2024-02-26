//@ts-nocheck
//@ts-ignore
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { ReloadIcon } from "@radix-ui/react-icons"
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@clerk/nextjs';

const supabaseUrl = 'https://dskxkhmdkzelakjkxtos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRza3hraG1ka3plbGFramt4dG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg0NDkxNjgsImV4cCI6MjAyNDAyNTE2OH0.169mYjzNZhcCbM_g1krGP7K_uu0eD6OI_pbaBsNoKIY';
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default function Generator() {
    const { user } = useUser();
    const [generatedId, setGeneratedId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [allocationError, setAllocationError] = useState(false);
    const [generatedDetails, setGeneratedDetails] = useState(null);

    const clerkUsername = user?.fullName;

    useEffect(() => {
        async function fetchGeneratedDetails() {
            if (generatedId) {
                try {
                    setIsLoading(true);
                    setAllocationError(false);

                    const { data, error } = await supabaseClient
                        .from('citizen_ids')
                        .select('*')
                        .eq('id', generatedId);

                    if (error) throw error;

                    if (data && data.length > 0) {
                        setGeneratedDetails(data[0]);
                    }
                } catch (error) {
                    console.error('Error fetching generated details:', error);
                    setAllocationError(true);
                } finally {
                    setIsLoading(false);
                }
            }
        }

        fetchGeneratedDetails();
    }, [generatedId]);

    async function generateId() {
        try {
            setIsLoading(true);
            setAllocationError(false);

            const { data: unusedIds, error } = await supabaseClient
                .from('citizen_ids')
                .select('id')
                .eq('is_issued', false);

            if (error) throw error;

            if (!unusedIds || unusedIds.length === 0) {
                setAllocationError(true);
                return;
            }

            const randomIndex = Math.floor(Math.random() * unusedIds.length);
            const randomUnusedId = unusedIds[randomIndex].id;

            const { error: updateError } = await supabaseClient
                .from('id_issuances')
                .insert([{ citizen_id: randomUnusedId, is_issued: true, issued_by: clerkUsername, issued_at: new Date() }]);

            if (updateError) throw updateError;

            // Update is_issued to true for the generated ID in the citizen_ids table
            const { error: updateCitizenError } = await supabaseClient
                .from('citizen_ids')
                .update({ is_issued: true })
                .eq('id', randomUnusedId);

            if (updateCitizenError) throw updateCitizenError;

            setGeneratedId(randomUnusedId);
        } catch (error) {
            console.error('Error generating ID:', error);
            setAllocationError(true);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex justify-center pt-20">
            <div className='flex flex-col gap-10'>
                <Card>
                    <CardContent>
                        <div className="space-y-8 pt-7 justify-center ">
                            <div className="space-y-2 justify-center">
                                <h2 className="text-3xl font-semibold">Generate ID</h2>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Click the generate id button to generate a unique ID
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <Button type="submit" onClick={generateId} className='animate-bounce'>
                                    {isLoading ? (
                                        <>
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : generatedId ? (
                                        'Generate ID'
                                    ) : (
                                        'Generate ID'
                                    )}
                                </Button>
                            </div>
                            <div className="flex justify-center">
                                {allocationError && (
                                    <p className="text-red-500 ml-4">All IDs are allocated. Kindly generate IDs later.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {generatedDetails && (
                    <Card>
                        <CardContent >
                            <CardHeader className='items-center'>
                                <CardTitle >{`Details for ID ${generatedDetails.id}`}</CardTitle>
                            </CardHeader>
                            <CardDescription className='text-black font-2xl mb-8 flex'>
                                <div className="flex-1">
                                    <p><strong>First Name:</strong> {generatedDetails.first_name}</p>
                                    <p><strong>Last Name:</strong> {generatedDetails.last_name}</p>
                                    <p><strong>Date of Birth:</strong> {generatedDetails.date_of_birth}</p>
                                    <p><strong>National ID Number:</strong> {generatedDetails.national_id_number}</p>
                                </div>
                                <div className="flex-1">
                                    <p><strong>Address:</strong> {generatedDetails.address}</p>
                                    <p><strong>Issuance Date:</strong> {generatedDetails.issuance_date}</p>
                                    <p><strong>Expiry Date:</strong> {generatedDetails.expiry_date}</p>
                                    <p><strong>Is Issued:</strong> {generatedDetails.is_issued ? 'Yes' : 'No'}</p>
                                </div>
                            </CardDescription>


                            <CardFooter className=' items-center text-xs justify-start space-x-6 text-purple-400'>
                                <p>These are the details for the randomly generated ID.</p>
                            </CardFooter>
                        </CardContent>
                    </Card>
                )}
            </div>

        </div>

    )
}
