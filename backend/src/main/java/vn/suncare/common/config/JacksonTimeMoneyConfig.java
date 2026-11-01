package vn.suncare.common.config;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.ZoneId;
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.core.JsonGenerator;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.ValueSerializer;
import tools.jackson.databind.module.SimpleModule;

@Configuration
public class JacksonTimeMoneyConfig {

	public static final ZoneId SAIGON_ZONE = ZoneId.of("Asia/Saigon");

	@Bean
	public Clock clock() {
		return Clock.systemUTC();
	}

	@Bean
	public JsonMapperBuilderCustomizer suncareMoneyAndTimeCustomizer() {
		SimpleModule moneyModule = new SimpleModule("SuncareMoneyModule");
		moneyModule.addSerializer(BigDecimal.class, new BigDecimalPlainStringSerializer());
		moneyModule.addDeserializer(BigDecimal.class, new StrictBigDecimalDeserializer());
		return builder -> builder.addModule(moneyModule);
	}

	static final class BigDecimalPlainStringSerializer extends ValueSerializer<BigDecimal> {
		@Override
		public void serialize(BigDecimal value, JsonGenerator gen, SerializationContext ctxt) {
			if (value == null) {
				gen.writeNull();
				return;
			}
			gen.writeString(value.stripTrailingZeros().toPlainString());
		}
	}

	static final class StrictBigDecimalDeserializer extends ValueDeserializer<BigDecimal> {
		@Override
		public BigDecimal deserialize(JsonParser p, DeserializationContext ctxt) {
			JsonToken token = p.currentToken();
			if (token == JsonToken.VALUE_STRING) {
				String raw = p.getString().trim();
				if (raw.isEmpty()) {
					return null;
				}
				try {
					return new BigDecimal(raw);
				} catch (NumberFormatException ex) {
					throw ctxt.weirdStringException(raw, BigDecimal.class, "Must be a valid decimal string");
				}
			}
			if (token == JsonToken.VALUE_NUMBER_INT) {
				return p.getDecimalValue();
			}
			return (BigDecimal) ctxt.handleUnexpectedToken(BigDecimal.class, p);
		}
	}
}
