import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback } from "react";
import {
  Platform,
  ScrollView,
  Dimensions,
  Text,
  View,
  Button,
} from "react-native";
import Storyteller, {
  StorytellerClipsRowView,
  StorytellerStoriesRowView,
  UIStyle,
} from "@getstoryteller/react-native-storyteller-sdk";

const getApiKey = () => {
  return Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_STORY_TELLER_API_KEY_IOS
    : process.env.EXPO_PUBLIC_STORY_TELLER_API_KEY_ANDROID;
};

export default function App() {
  const [cup, setCup] = useState<"DC" | "BJKC">("DC");
  const [isStorytellerInitialized, setIsStorytellerInitialized] =
    useState(false);

  const initializeStoryteller = useCallback(() => {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("Storyteller API key not found");
      return;
    }

    Storyteller.initialize(
      {
        apiKey: apiKey,
      },
      (callback: { result: boolean; message: string }) => {
        console.log(`Storyteller initialized: ${callback.result}`);
        setIsStorytellerInitialized(callback.result);
      }
    );
  }, []);

  useEffect(() => {
    initializeStoryteller();
  }, [initializeStoryteller]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingTop: 60, gap: 20 }}
    >
      <View style={{ alignItems: "center", gap: 10 }}>
        <Text>Current cup: {cup}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button title="switch to DC" onPress={() => setCup("DC")} />
          <Button title="switch to BJKC" onPress={() => setCup("BJKC")} />
        </View>
      </View>
      {isStorytellerInitialized && cup === "DC" && (
        <StorytellerStoriesRowView
          key={"davis-cup"}
          style={{ width: Dimensions.get("window").width, height: 100 }}
          configuration={{
            cellType: "round",
            uiStyle: UIStyle.dark,
            categories: ["davis-cup"],
          }}
        />
      )}
      {isStorytellerInitialized && cup === "BJKC" && (
        <StorytellerStoriesRowView
          key={"billie-jean-king-cup"}
          style={{ width: Dimensions.get("window").width, height: 100 }}
          configuration={{
            cellType: "round",
            uiStyle: UIStyle.dark,
            categories: ["billie-jean-king-cup"],
          }}
        />
      )}
      {isStorytellerInitialized && (
        <StorytellerClipsRowView
          isScrollable={true}
          configuration={{
            collection: "winningmoments",
            displayLimit: 10,
            cellType: "square",
            uiStyle: UIStyle.dark,
          }}
          style={{ width: Dimensions.get("window").width, height: 100 }}
          onDataLoadStarted={() => {
            console.log("onDataLoadStarted");
          }}
          onDataLoadCompleted={() => {
            console.log("onDataLoadCompleted");
          }}
          onPlayerDismissed={() => {
            console.log("onPlayerDismissed");
          }}
        />
      )}
      <StatusBar style="auto" />
    </ScrollView>
  );
}
