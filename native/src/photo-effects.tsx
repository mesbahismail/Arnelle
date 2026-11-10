import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  Filter,
  FeColorMatrix,
  Image as SvgImage,
} from "react-native-svg";
export function PhotoEffects({
  uri,
  filter = "Default",
}: {
  uri: string;
  filter?: string;
}) {
  if (filter === "Black & White")
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Filter id="monochrome">
            <FeColorMatrix type="saturate" values="0" />
          </Filter>
        </Defs>
        <SvgImage
          href={{ uri }}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          filter="url(#monochrome)"
        />
      </Svg>
    );
  return (
    <>
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />
      {filter !== "Default" && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor:
                filter === "Golden" || filter === "Popstar"
                  ? "#ef94452b"
                  : "#6480da24",
            },
          ]}
        />
      )}
    </>
  );
}
