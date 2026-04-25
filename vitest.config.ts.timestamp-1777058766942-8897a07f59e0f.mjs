// vitest.config.ts
import { defineConfig } from "file:///C:/SUNNY/SAI%20CHARAN/Professional/ELECTION%20SAATHI%20INDIA/node_modules/vitest/dist/config.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\SUNNY\\SAI CHARAN\\Professional\\ELECTION SAATHI INDIA";
var vitest_config_default = defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/main.ts", "src/types/**"],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    },
    setupFiles: []
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      "@services": resolve(__vite_injected_original_dirname, "src/services"),
      "@data": resolve(__vite_injected_original_dirname, "src/data"),
      "@utils": resolve(__vite_injected_original_dirname, "src/utils"),
      "@scene": resolve(__vite_injected_original_dirname, "src/scene"),
      "@ui": resolve(__vite_injected_original_dirname, "src/ui"),
      "@types": resolve(__vite_injected_original_dirname, "src/types")
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFNVTk5ZXFxcXFNBSSBDSEFSQU5cXFxcUHJvZmVzc2lvbmFsXFxcXEVMRUNUSU9OIFNBQVRISSBJTkRJQVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcU1VOTllcXFxcU0FJIENIQVJBTlxcXFxQcm9mZXNzaW9uYWxcXFxcRUxFQ1RJT04gU0FBVEhJIElORElBXFxcXHZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1NVTk5ZL1NBSSUyMENIQVJBTi9Qcm9mZXNzaW9uYWwvRUxFQ1RJT04lMjBTQUFUSEklMjBJTkRJQS92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbi8qKlxuICogVml0ZXN0IGNvbmZpZ3VyYXRpb24gZm9yIEVsZWN0aW9uIFNhYXRoaSBJbmRpYSB0ZXN0IHN1aXRlLlxuICpcbiAqIFVzZXMganNkb20gZm9yIERPTS1iYXNlZCB0ZXN0cyBpbmNsdWRpbmcgYWNjZXNzaWJsZSBmYWxsYmFjayBsYXllciB0ZXN0aW5nLlxuICogTWlycm9ycyBWaXRlIHBhdGggYWxpYXNlcyBzbyB0ZXN0cyBjYW4gaW1wb3J0IGlkZW50aWNhbGx5IHRvIHNvdXJjZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgaW5jbHVkZTogWyd0ZXN0cy8qKi8qLnRlc3QudHMnXSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2xjb3YnXSxcbiAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoudHMnXSxcbiAgICAgIGV4Y2x1ZGU6IFsnc3JjL21haW4udHMnLCAnc3JjL3R5cGVzLyoqJ10sXG4gICAgICB0aHJlc2hvbGRzOiB7XG4gICAgICAgIHN0YXRlbWVudHM6IDcwLFxuICAgICAgICBicmFuY2hlczogNjAsXG4gICAgICAgIGZ1bmN0aW9uczogNzAsXG4gICAgICAgIGxpbmVzOiA3MCxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzZXR1cEZpbGVzOiBbXSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgICAnQHNlcnZpY2VzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2VydmljZXMnKSxcbiAgICAgICdAZGF0YSc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2RhdGEnKSxcbiAgICAgICdAdXRpbHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy91dGlscycpLFxuICAgICAgJ0BzY2VuZSc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NjZW5lJyksXG4gICAgICAnQHVpJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdWknKSxcbiAgICAgICdAdHlwZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy90eXBlcycpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1csU0FBUyxvQkFBb0I7QUFDclksU0FBUyxlQUFlO0FBRHhCLElBQU0sbUNBQW1DO0FBU3pDLElBQU8sd0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFNBQVMsQ0FBQyxvQkFBb0I7QUFBQSxJQUM5QixVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxNQUFNO0FBQUEsTUFDekIsU0FBUyxDQUFDLGFBQWE7QUFBQSxNQUN2QixTQUFTLENBQUMsZUFBZSxjQUFjO0FBQUEsTUFDdkMsWUFBWTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLFFBQ1YsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxZQUFZLENBQUM7QUFBQSxFQUNmO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQzdCLGFBQWEsUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDOUMsU0FBUyxRQUFRLGtDQUFXLFVBQVU7QUFBQSxNQUN0QyxVQUFVLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQ3hDLFVBQVUsUUFBUSxrQ0FBVyxXQUFXO0FBQUEsTUFDeEMsT0FBTyxRQUFRLGtDQUFXLFFBQVE7QUFBQSxNQUNsQyxVQUFVLFFBQVEsa0NBQVcsV0FBVztBQUFBLElBQzFDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
