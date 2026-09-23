import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { CalculatorResult } from '@/lib/types';
import { daysBetween } from '@/lib/cycleMath';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  result: CalculatorResult;
};

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 96;
const STROKE_WIDTH = 24;
const LABEL_RADIUS = RADIUS + 30;

function polarToCartesian(radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

function describeArc(radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(radius, startAngle);
  const end = polarToCartesian(radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function labelAnchorAndOffset(angleDeg: number): { anchor: 'start' | 'middle' | 'end'; dy: number } {
  const angle = ((angleDeg % 360) + 360) % 360;
  if (angle >= 315 || angle < 45) return { anchor: 'middle', dy: -6 };
  if (angle >= 135 && angle < 225) return { anchor: 'middle', dy: 16 };
  return { anchor: 'middle', dy: 5 };
}

export function CyclePhaseDiagram({ result }: Props) {
  const theme = useTheme();
  const { lastPeriodStart, periodLength, cycleLength, ovulationDate, fertileWindowStart, fertileWindowEnd } =
    result;

  const periodEndDay = periodLength;
  const ovulationDay = daysBetween(lastPeriodStart, ovulationDate);
  const fertileStartDay = Math.max(periodEndDay, daysBetween(lastPeriodStart, fertileWindowStart));
  const fertileEndDay = Math.min(
    cycleLength,
    Math.max(fertileStartDay + 1, daysBetween(lastPeriodStart, fertileWindowEnd) + 1)
  );

  const angleOf = (day: number) => (day / cycleLength) * 360;

  const periodArc = describeArc(RADIUS, angleOf(0), angleOf(periodEndDay));
  const follicularArc = describeArc(RADIUS, angleOf(periodEndDay), angleOf(fertileStartDay));
  const fertileArc = describeArc(RADIUS, angleOf(fertileStartDay), angleOf(fertileEndDay));
  const lutealArc = describeArc(RADIUS, angleOf(fertileEndDay), angleOf(cycleLength));

  const ovulationPoint = polarToCartesian(RADIUS, angleOf(Math.min(ovulationDay, cycleLength)));

  const periodLabel = polarToCartesian(LABEL_RADIUS, angleOf(periodEndDay / 2));
  const periodLabelStyle = labelAnchorAndOffset(angleOf(periodEndDay / 2));

  const follicularLabel = polarToCartesian(LABEL_RADIUS, angleOf((periodEndDay + fertileStartDay) / 2));
  const follicularLabelStyle = labelAnchorAndOffset(angleOf((periodEndDay + fertileStartDay) / 2));

  const fertileLabel = polarToCartesian(LABEL_RADIUS, angleOf((fertileStartDay + fertileEndDay) / 2));
  const fertileLabelStyle = labelAnchorAndOffset(angleOf((fertileStartDay + fertileEndDay) / 2));

  const lutealLabel = polarToCartesian(LABEL_RADIUS, angleOf((fertileEndDay + cycleLength) / 2));
  const lutealLabelStyle = labelAnchorAndOffset(angleOf((fertileEndDay + cycleLength) / 2));

  const textColor = theme.text;

  return (
    <View style={[styles.container, { backgroundColor: theme.diagramBackground }]}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={theme.diagramTrack}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Path d={follicularArc} stroke={theme.diagramTrack} strokeWidth={STROKE_WIDTH} fill="none" />
        <Path d={lutealArc} stroke={theme.diagramTrack} strokeWidth={STROKE_WIDTH} fill="none" />
        <Path
          d={periodArc}
          stroke={theme.period}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={fertileArc}
          stroke={theme.accent}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={ovulationPoint.x} cy={ovulationPoint.y} r={7} fill="#ffffff" stroke={theme.accent} strokeWidth={3} />

        <SvgText
          x={periodLabel.x}
          y={periodLabel.y}
          dy={periodLabelStyle.dy}
          fontSize={13}
          fontWeight="600"
          fill={textColor}
          textAnchor={periodLabelStyle.anchor}>
          Period
        </SvgText>
        <SvgText
          x={follicularLabel.x}
          y={follicularLabel.y}
          dy={follicularLabelStyle.dy}
          fontSize={13}
          fontWeight="600"
          fill={textColor}
          textAnchor={follicularLabelStyle.anchor}>
          Follicular
        </SvgText>
        <SvgText
          x={fertileLabel.x}
          y={fertileLabel.y}
          dy={fertileLabelStyle.dy - 12}
          fontSize={13}
          fontWeight="600"
          fill={textColor}
          textAnchor={fertileLabelStyle.anchor}>
          Ovulation
        </SvgText>
        <SvgText
          x={fertileLabel.x}
          y={fertileLabel.y}
          dy={fertileLabelStyle.dy + 4}
          fontSize={13}
          fontWeight="600"
          fill={textColor}
          textAnchor={fertileLabelStyle.anchor}>
          Fertile days
        </SvgText>
        <SvgText
          x={lutealLabel.x}
          y={lutealLabel.y}
          dy={lutealLabelStyle.dy}
          fontSize={13}
          fontWeight="600"
          fill={textColor}
          textAnchor={lutealLabelStyle.anchor}>
          Luteal
        </SvgText>

        <SvgText x={CENTER} y={CENTER - 4} fontSize={28} fontWeight="800" fill={textColor} textAnchor="middle">
          {cycleLength}
        </SvgText>
        <SvgText
          x={CENTER}
          y={CENTER + 18}
          fontSize={14}
          fontWeight="500"
          fill={theme.textSecondary}
          textAnchor="middle">
          day cycle
        </SvgText>
      </Svg>
      <View style={styles.legend}>
        <LegendItem color={theme.period} label="Period" />
        <LegendItem color={theme.accent} label="Ovulation & fertile days" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.five,
    alignItems: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.three,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
