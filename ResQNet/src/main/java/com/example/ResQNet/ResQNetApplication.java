package com.example.ResQNet;

import com.example.ResQNet.Config.Appconfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

@SpringBootApplication
public class ResQNetApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResQNetApplication.class, args);
		ApplicationContext context = new AnnotationConfigApplicationContext(Appconfig.class);
		User user = context.getBean(User.class);
		System.out.println(user);
	}

}
