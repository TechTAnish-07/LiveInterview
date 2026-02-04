package LiveInterview.example.LiveInterview.DTO;

import java.util.Arrays;
import java.util.Set;

public enum Judge0Language {

    JAVA(62, "java"),
    CPP(54, "cpp", "c++"),
    PYTHON(71, "python", "python3");

    private final int id;
    private final Set<String> aliases;

    Judge0Language(int id, String... aliases) {
        this.id = id;
        this.aliases = Set.of(aliases);
    }

    public int getId() {
        return id;
    }

    public static int fromName(String name) {
        return Arrays.stream(values())
                .filter(lang ->
                        lang.name().equalsIgnoreCase(name)
                                || lang.aliases.contains(name.toLowerCase()))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unsupported language: " + name))
                .getId();
    }
}
