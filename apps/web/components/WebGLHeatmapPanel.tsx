"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMarketSocket } from "../hooks/useMarketSocket";

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform float u_rows[80];

vec3 palette(float x) {
  if (x < 0.35) return mix(vec3(0.02, 0.06, 0.20), vec3(0.10, 0.35, 1.00), x / 0.35);
  if (x < 0.65) return mix(vec3(0.10, 0.35, 1.00), vec3(1.00, 0.85, 0.18), (x - 0.35) / 0.30);
  return mix(vec3(1.00, 0.85, 0.18), vec3(1.00, 0.18, 0.08), (x - 0.65) / 0.35);
}

void main() {
  float row = floor((1.0 - v_uv.y) * 80.0);
  int idx = int(row);
  float intensity = 0.0;

  for (int i = 0; i < 80; i++) {
    if (i == idx) intensity = u_rows[i];
  }

  float fade = smoothstep(1.0, 0.0, v_uv.x);
  float glow = intensity * (0.25 + 0.75 * fade);
  vec3 base = vec3(0.015, 0.025, 0.045);
  vec3 color = mix(base, palette(glow), glow);
  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "WebGL shader compile failed");
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "WebGL program link failed");
  }

  return program;
}

export function WebGLHeatmapPanel() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rowsRef = useRef<Float32Array>(new Float32Array(80));
  const { messages } = useMarketSocket("hyperliquid", "BTC-USD", ["heatmap"]);

  const tile = useMemo(() => {
    return [...messages].reverse().find((m) => m.topic.startsWith("heatmap:"))?.payload ?? null;
  }, [messages]);

  useEffect(() => {
    const buckets = Array.isArray(tile?.buckets) ? tile.buckets : [];
    const rows = new Float32Array(80);

    if (buckets.length > 0) {
      buckets.slice(0, 80).forEach((bucket: any, index: number) => {
        rows[index] = Math.max(0, Math.min(1, Number(bucket.intensity ?? 0)));
      });
    } else {
      for (let i = 0; i < rows.length; i++) {
        rows[i] = Math.max(0, Math.sin(i * 0.31) * 0.5 + Math.random() * 0.35);
      }
    }

    rowsRef.current = rows;
  }, [tile]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: false });
    if (!gl) return;

    const program = createProgram(gl);
    programRef.current = program;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const rowsLoc = gl.getUniformLocation(program, "u_rows");

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.useProgram(program);
      gl.uniform1f(timeLoc, performance.now() / 1000);
      gl.uniform1fv(rowsLoc, rowsRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();

    return () => {
      cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: 260, display: "block" }} />;
}
