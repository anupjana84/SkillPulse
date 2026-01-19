import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { userApi } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

const TournamentDetails = ({ route }: { route: any }) => {
    const { tournamentId } = route.params;
    const [countdownText, setCountdownText] = useState("00:00:00");
    const [isRedirecting, setIsRedirecting] = useState(false);

    // 1. Fetch Tournament - Get refetch function
    const {
        data: response,
        isLoading: isTournamentLoading,
        refetch: refetchTournament
    } = useQuery({
        queryKey: ['tournament', tournamentId],
        queryFn: () => userApi.getMyTournamentById(tournamentId),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
    console.log(response, "response")

    // 2. Fetch Upcoming Tournament - Get refetch function
    const {
        data: upcomingTournament,
        isLoading: isUpcomingTournamentLoading,
        error,
        refetch: refetchUpcomingTournament
    } = useQuery({
        queryKey: ['upcomingTournament'],
        queryFn: userApi.getUpcomingTournament,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });
    console.log(upcomingTournament, "upcomingTournament")

    const handleRedirect = async () => {
        if (isRedirecting) return;
        setIsRedirecting(true);

        try {
            // Refetch both APIs when countdown ends
            console.log("Refetching tournament and upcoming tournament data...");
            await Promise.all([
                refetchTournament(),
                refetchUpcomingTournament()
            ]);

            console.log("Refetch complete!");

            // Step 1: Call the pairList API
            const pairResponse = await userApi.getPairList(tournamentId);
            const matchUrl = pairResponse?.data?.[0]?.matchUrl;
            console.log(matchUrl, pairResponse, 'pairResponse')
            return

            if (!matchUrl) {
                Alert.alert("Notice", "Match is being prepared, please wait...");
                setIsRedirecting(false);
                return;
            }

            const roomId = matchUrl.split('tournament:')[1]?.split('/')[0];

            // navigation.replace("TournamentGridScreen", {
            //     roomId: roomId,
            //     userColor: userColor,
            // });
        } catch (err) {
            console.error("Redirect error:", err);
            setIsRedirecting(false);
        }
    };

    // 3. Countdown Logic
    useEffect(() => {
        const apiTime = response?.data?.time;
        if (!apiTime) return;

        const [hours, minutes] = apiTime.split(':');
        const targetDate = moment().set({
            hour: parseInt(hours),
            minute: parseInt(minutes),
            second: 0
        });

        if (targetDate.isBefore(moment())) {
            targetDate.add(1, 'days');
        }

        const interval = setInterval(() => {
            const now = moment();
            const diff = moment.duration(targetDate.diff(now));

            if (diff.asMilliseconds() <= 0) {
                clearInterval(interval);
                setCountdownText("Started!");
                handleRedirect(); // This will now refetch both APIs
            } else {
                const h = String(diff.hours()).padStart(2, '0');
                const m = String(diff.minutes()).padStart(2, '0');
                const s = String(diff.seconds()).padStart(2, '0');
                setCountdownText(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [response]);

    // 4. Early returns
    if (isTournamentLoading || isUpcomingTournamentLoading) return <Text>Loading...</Text>;
    if (error) return <Text>Error loading profile</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.timer}>{countdownText}</Text>
            <Text>Tournament: {response?.data?.name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    timer: { fontSize: 40, fontWeight: 'bold', fontVariant: ['tabular-nums'] }
});

export default TournamentDetails;